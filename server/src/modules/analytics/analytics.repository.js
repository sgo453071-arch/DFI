const User = require('../user/user.model');
const Program = require('../program/program.model');
const Application = require('../application/application.model');
const Attendance = require('../attendance/attendance.model');
const Certificate = require('../certificate/certificate.model');
const RewardTransaction = require('../reward-transaction/rewardTransaction.model');
const Organization = require('../organization/organization.model');
const Role = require('../role/role.model');
const Permission = require('../permission/permission.model');
const UserBadge = require('../leaderboard/user-badge.model');
const UserAchievement = require('../leaderboard/user-achievement.model');
const Notification = require('../notification/notification.model');
const { calculatePercentage, calculateGrowthRate } = require('./analytics.utils');

class AnalyticsRepository {
  /**
   * Build date filter for queries
   * @param {string} dateRange - Date range type
   * @param {string} dateField - Field to filter on
   * @param {object} query - Existing query object to merge with
   * @returns {object} Updated query with date filter
   */
  _buildDateFilter(dateRange, dateField, query = {}) {
    const now = new Date();
    const filter = { ...query, isDeleted: false };

    switch (dateRange) {
      case 'today': {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        filter[dateField] = { $gte: todayStart, $lt: todayEnd };
        break;
      }

      case 'this_week': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        filter[dateField] = { $gte: startOfWeek, $lt: endOfWeek };
        break;
      }

      case 'this_month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        filter[dateField] = { $gte: startOfMonth, $lt: endOfMonth };
        break;
      }

      case 'last_month': {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        lastMonthEnd.setHours(23, 59, 59, 999);
        filter[dateField] = { $gte: lastMonthStart, $lt: lastMonthEnd };
        break;
      }

      case 'last_3_months': {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        threeMonthsAgo.setHours(0, 0, 0, 0);
        filter[dateField] = { $gte: threeMonthsAgo };
        break;
      }

      case 'last_6_months': {
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        filter[dateField] = { $gte: sixMonthsAgo };
        break;
      }

      case 'last_year': {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        oneYearAgo.setHours(0, 0, 0, 0);
        filter[dateField] = { $gte: oneYearAgo };
        break;
      }

      default:
        break;
    }

    return filter;
  }

  // ============================================================
  // VOLUNTEER ANALYTICS
  // ============================================================

  /**
   * Get volunteers joined per month
   */
  async getVolunteersJoinedPerMonth(dateRange = null) {
    const matchStage = { role: 'volunteer', isDeleted: false };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'createdAt', {}));
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
                { case: { $eq: ['$_id.month', 2] }, then: 'Feb' },
                { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
                { case: { $eq: ['$_id.month', 4] }, then: 'Apr' },
                { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                { case: { $eq: ['$_id.month', 6] }, then: 'Jun' },
                { case: { $eq: ['$_id.month', 7] }, then: 'Jul' },
                { case: { $eq: ['$_id.month', 8] }, then: 'Aug' },
                { case: { $eq: ['$_id.month', 9] }, then: 'Sep' },
                { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
                { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
                { case: { $eq: ['$_id.month', 12] }, then: 'Dec' },
              ],
              default: '',
            },
          },
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ];

    return User.aggregate(pipeline);
  }

  /**
   * Get active/inactive volunteers
   */
  async getVolunteerStatusDistribution(dateRange = null) {
    const matchStage = { role: 'volunteer', isDeleted: false };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'createdAt', {}));
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ];

    return User.aggregate(pipeline);
  }

  /**
   * Get volunteers by state
   */
  async getVolunteersByState(dateRange = null) {
    const matchStage = {
      role: 'volunteer',
      isDeleted: false,
      $and: [
        { state: { $exists: true } },
        { state: { $ne: '' } },
      ],
    };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'createdAt', {}));
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          state: '$_id',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ];

    return User.aggregate(pipeline);
  }

  /**
   * Get volunteers by city
   */
  async getVolunteersByCity(dateRange = null) {
    const matchStage = {
      role: 'volunteer',
      isDeleted: false,
      $and: [
        { city: { $exists: true } },
        { city: { $ne: '' } },
      ],
    };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'createdAt', {}));
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          city: '$_id',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ];

    return User.aggregate(pipeline);
  }

  /**
   * Get volunteer growth rate
   */
  async getVolunteerGrowthRate() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [currentCount, previousCount] = await Promise.all([
      User.countDocuments({ role: 'volunteer', isDeleted: false, createdAt: { $gte: currentMonthStart } }),
      User.countDocuments({
        role: 'volunteer',
        isDeleted: false,
        createdAt: { $gte: previousMonthStart, $lt: previousMonthEnd },
      }),
    ]);

    return calculateGrowthRate(currentCount, previousCount);
  }

  /**
   * Get all volunteer analytics
   */
  async getVolunteerAnalytics(dateRange = null) {
    const [
      joinedPerMonth,
      statusDistribution,
      byState,
      byCity,
      growthRate,
      totalVolunteers,
      activeVolunteers,
      inactiveVolunteers,
    ] = await Promise.all([
      this.getVolunteersJoinedPerMonth(dateRange),
      this.getVolunteerStatusDistribution(dateRange),
      this.getVolunteersByState(dateRange),
      this.getVolunteersByCity(dateRange),
      this.getVolunteerGrowthRate(),
      User.countDocuments({ role: 'volunteer', isDeleted: false }),
      User.countDocuments({ role: 'volunteer', status: 'active', isDeleted: false }),
      User.countDocuments({
        role: 'volunteer',
        status: { $in: ['inactive', 'suspended'] },
        isDeleted: false,
      }),
    ]);

    const totalForState = byState.reduce((sum, item) => sum + item.count, 0);
    const statePercentages = byState.map((item) => ({
      state: item.state,
      count: item.count,
      percentage: calculatePercentage(item.count, totalForState),
    }));

    const totalForCity = byCity.reduce((sum, item) => sum + item.count, 0);
    const cityPercentages = byCity.map((item) => ({
      city: item.city,
      count: item.count,
      percentage: calculatePercentage(item.count, totalForCity),
    }));

    return {
      totalVolunteers,
      activeVolunteers,
      inactiveVolunteers,
      growthRate,
      volunteersJoinedPerMonth: joinedPerMonth,
      volunteersByState: statePercentages,
      volunteersByCity: cityPercentages,
      statusDistribution,
    };
  }

  // ============================================================
  // PROGRAM ANALYTICS
  // ============================================================

  /**
   * Get programs created per month
   */
  async getProgramsCreatedPerMonth(dateRange = null) {
    const matchStage = { isDeleted: false };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'createdAt', {}));
    }

    const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          monthName: {
            $switch: {
              branches: MONTH_NAMES.slice(1).map((name, i) => ({ case: { $eq: ['$_id.month', i + 1] }, then: name })),
              default: '',
            },
          },
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ];

    return Program.aggregate(pipeline);
  }

  /**
   * Get programs by status
   */
  async getProgramStatusDistribution(dateRange = null) {
    const matchStage = { isDeleted: false };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'createdAt', {}));
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ];

    return Program.aggregate(pipeline);
  }

  /**
   * Get programs by category
   */
  async getProgramsByCategory(dateRange = null) {
    const matchStage = { isDeleted: false, category: { $exists: true, $ne: '' } };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'createdAt', {}));
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ];

    return Program.aggregate(pipeline);
  }

  /**
   * Get programs by state
   */
  async getProgramsByState(dateRange = null) {
    const matchStage = { isDeleted: false, state: { $exists: true, $ne: '' } };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'createdAt', {}));
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          state: '$_id',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ];

    return Program.aggregate(pipeline);
  }

  /**
   * Get all program analytics
   */
  async getProgramAnalytics(dateRange = null) {
    const [
      createdPerMonth,
      statusDistribution,
      byCategory,
      byState,
      totalPrograms,
      activePrograms,
      completedPrograms,
      cancelledPrograms,
    ] = await Promise.all([
      this.getProgramsCreatedPerMonth(dateRange),
      this.getProgramStatusDistribution(dateRange),
      this.getProgramsByCategory(dateRange),
      this.getProgramsByState(dateRange),
      Program.countDocuments({ isDeleted: false }),
      Program.countDocuments({ status: { $in: ['published', 'ongoing', 'registration_closed'] }, isDeleted: false }),
      Program.countDocuments({ status: 'completed', isDeleted: false }),
      Program.countDocuments({ status: 'cancelled', isDeleted: false }),
    ]);

    return {
      totalPrograms,
      activePrograms,
      completedPrograms,
      cancelledPrograms,
      programsCreatedPerMonth: createdPerMonth,
      statusDistribution,
      programsByCategory: byCategory,
      programsByState: byState,
    };
  }

  // ============================================================
  // APPLICATION ANALYTICS
  // ============================================================

  /**
   * Get applications per month
   */
  async getApplicationsPerMonth(dateRange = null) {
    const matchStage = { isDeleted: false };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'appliedAt', {}));
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$appliedAt' },
            month: { $month: '$appliedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
                { case: { $eq: ['$_id.month', 2] }, then: 'Feb' },
                { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
                { case: { $eq: ['$_id.month', 4] }, then: 'Apr' },
                { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                { case: { $eq: ['$_id.month', 6] }, then: 'Jun' },
                { case: { $eq: ['$_id.month', 7] }, then: 'Jul' },
                { case: { $eq: ['$_id.month', 8] }, then: 'Aug' },
                { case: { $eq: ['$_id.month', 9] }, then: 'Sep' },
                { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
                { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
                { case: { $eq: ['$_id.month', 12] }, then: 'Dec' },
              ],
              default: '',
            },
          },
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ];

    return Application.aggregate(pipeline);
  }

  /**
   * Get application status distribution
   */
  async getApplicationStatusDistribution(dateRange = null) {
    const matchStage = { isDeleted: false };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'appliedAt', {}));
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ];

    return Application.aggregate(pipeline);
  }

  /**
   * Get applications by program
   */
  async getApplicationsByProgram(_dateRange = null) {
    const pipeline = [
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'programs',
          localField: 'program',
          foreignField: '_id',
          as: 'program',
        },
      },
      { $unwind: { path: '$program', preserveNullAndEmptyArray: true } },
      {
        $group: {
          _id: '$program.title',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          program: '$_id',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ];

    return Application.aggregate(pipeline);
  }

  /**
   * Get all application analytics
   */
  async getApplicationAnalytics(dateRange = null) {
    const [
      perMonth,
      statusDistribution,
      byProgram,
      totalApplications,
      approvedCount,
      rejectedCount,
      pendingCount,
    ] = await Promise.all([
      this.getApplicationsPerMonth(dateRange),
      this.getApplicationStatusDistribution(dateRange),
      this.getApplicationsByProgram(dateRange),
      Application.countDocuments({ isDeleted: false }),
      Application.countDocuments({ status: { $in: ['approved', 'joined'] }, isDeleted: false }),
      Application.countDocuments({ status: 'rejected', isDeleted: false }),
      Application.countDocuments({ status: { $in: ['applied', 'pending', 'under_review'] }, isDeleted: false }),
    ]);

    const approvalRate = calculatePercentage(approvedCount, totalApplications);
    const rejectionRate = calculatePercentage(rejectedCount, totalApplications);
    const pendingRate = calculatePercentage(pendingCount, totalApplications);

    return {
      totalApplications,
      approvalRate,
      rejectionRate,
      pendingRate,
      applicationsPerMonth: perMonth,
      statusDistribution,
      applicationsByProgram: byProgram,
    };
  }

  // ============================================================
  // ATTENDANCE ANALYTICS
  // ============================================================

  /**
   * Get total volunteer hours
   */
  async getTotalVolunteerHours(dateRange = null) {
    const matchStage = { isDeleted: false };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'attendanceDate', {}));
    }

    const result = await Attendance.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalHours: { $sum: '$totalHours' } } },
    ]);

    return result[0]?.totalHours || 0;
  }

  /**
   * Get attendance by day
   */
  async getDailyAttendance(dateRange = null) {
    const matchStage = { isDeleted: false };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'attendanceDate', {}));
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$attendanceDate' },
            month: { $month: '$attendanceDate' },
            day: { $dayOfMonth: '$attendanceDate' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$attendanceDate' },
          },
          count: 1,
        },
      },
      { $sort: { date: 1 } },
    ];

    return Attendance.aggregate(pipeline);
  }

  /**
   * Get attendance by month
   */
  async getMonthlyAttendance(dateRange = null) {
    const matchStage = { isDeleted: false };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'attendanceDate', {}));
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$attendanceDate' },
            month: { $month: '$attendanceDate' },
          },
          count: { $sum: 1 },
          totalHours: { $sum: '$totalHours' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
                { case: { $eq: ['$_id.month', 2] }, then: 'Feb' },
                { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
                { case: { $eq: ['$_id.month', 4] }, then: 'Apr' },
                { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                { case: { $eq: ['$_id.month', 6] }, then: 'Jun' },
                { case: { $eq: ['$_id.month', 7] }, then: 'Jul' },
                { case: { $eq: ['$_id.month', 8] }, then: 'Aug' },
                { case: { $eq: ['$_id.month', 9] }, then: 'Sep' },
                { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
                { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
                { case: { $eq: ['$_id.month', 12] }, then: 'Dec' },
              ],
              default: '',
            },
          },
          count: 1,
          totalHours: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ];

    return Attendance.aggregate(pipeline);
  }

  /**
   * Get attendance by program
   */
  async getAttendanceByProgram(_dateRange = null) {
    const pipeline = [
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'programs',
          localField: 'program',
          foreignField: '_id',
          as: 'program',
        },
      },
      { $unwind: { path: '$program', preserveNullAndEmptyArray: true } },
      {
        $group: {
          _id: '$program.title',
          count: { $sum: 1 },
          totalHours: { $sum: '$totalHours' },
        },
      },
      {
        $project: {
          _id: 0,
          program: '$_id',
          count: 1,
          totalHours: 1,
        },
      },
      { $sort: { count: -1 } },
    ];

    return Attendance.aggregate(pipeline);
  }

  /**
   * Get all attendance analytics
   */
  async getAttendanceAnalytics(dateRange = null) {
    const [
      totalHours,
      dailyAttendance,
      monthlyAttendance,
      byProgram,
      totalAttendance,
      presentCount,
      _absentCount,
    ] = await Promise.all([
      this.getTotalVolunteerHours(dateRange),
      this.getDailyAttendance(dateRange),
      this.getMonthlyAttendance(dateRange),
      this.getAttendanceByProgram(dateRange),
      Attendance.countDocuments({ isDeleted: false }),
      Attendance.countDocuments({ status: 'present', isDeleted: false }),
      Attendance.countDocuments({ status: 'absent', isDeleted: false }),
    ]);

    return {
      totalHours,
      attendanceRate: calculatePercentage(presentCount, totalAttendance),
      dailyAttendance,
      monthlyAttendance,
      attendanceByProgram: byProgram,
    };
  }

  // ============================================================
  // CERTIFICATE ANALYTICS
  // ============================================================

  /**
   * Get certificates generated
   */
  async getCertificatesGenerated(dateRange = null) {
    const matchStage = { status: 'issued', isDeleted: false };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'issuedAt', {}));
    }

    const result = await Certificate.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]);

    return result[0]?.total || 0;
  }

  /**
   * Get certificates by program
   */
  async getCertificatesByProgram(_dateRange = null) {
    const pipeline = [
      { $match: { status: 'issued', isDeleted: false } },
      {
        $lookup: {
          from: 'programs',
          localField: 'program',
          foreignField: '_id',
          as: 'program',
        },
      },
      { $unwind: { path: '$program', preserveNullAndEmptyArray: true } },
      {
        $group: {
          _id: '$program.title',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          program: '$_id',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ];

    return Certificate.aggregate(pipeline);
  }

  /**
   * Get certificates by month
   */
  async getCertificatesByMonth(dateRange = null) {
    const matchStage = { status: 'issued', isDeleted: false };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'issuedAt', {}));
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$issuedAt' },
            month: { $month: '$issuedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
                { case: { $eq: ['$_id.month', 2] }, then: 'Feb' },
                { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
                { case: { $eq: ['$_id.month', 4] }, then: 'Apr' },
                { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                { case: { $eq: ['$_id.month', 6] }, then: 'Jun' },
                { case: { $eq: ['$_id.month', 7] }, then: 'Jul' },
                { case: { $eq: ['$_id.month', 8] }, then: 'Aug' },
                { case: { $eq: ['$_id.month', 9] }, then: 'Sep' },
                { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
                { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
                { case: { $eq: ['$_id.month', 12] }, then: 'Dec' },
              ],
              default: '',
            },
          },
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ];

    return Certificate.aggregate(pipeline);
  }

  /**
   * Get all certificate analytics
   */
  async getCertificateAnalytics(dateRange = null) {
    const [totalCertificates, byProgram, byMonth] = await Promise.all([
      this.getCertificatesGenerated(dateRange),
      this.getCertificatesByProgram(dateRange),
      this.getCertificatesByMonth(dateRange),
    ]);

    return {
      certificatesGenerated: totalCertificates,
      certificatesByProgram: byProgram,
      certificatesByMonth: byMonth,
    };
  }

  // ============================================================
  // REWARD ANALYTICS
  // ============================================================

  /**
   * Get coins distributed
   */
  async getCoinsDistributed(dateRange = null) {
    const matchStage = { isDeleted: false };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'createdAt', {}));
    }

    const result = await RewardTransaction.aggregate([
      { $match: { ...matchStage, coins: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$coins' } } },
    ]);

    return result[0]?.total || 0;
  }

  /**
   * Get coins earned by month
   */
  async getCoinsEarnedByMonth(dateRange = null) {
    const matchStage = { isDeleted: false, coins: { $gt: 0 } };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'createdAt', {}));
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          coins: { $sum: '$coins' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
                { case: { $eq: ['$_id.month', 2] }, then: 'Feb' },
                { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
                { case: { $eq: ['$_id.month', 4] }, then: 'Apr' },
                { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                { case: { $eq: ['$_id.month', 6] }, then: 'Jun' },
                { case: { $eq: ['$_id.month', 7] }, then: 'Jul' },
                { case: { $eq: ['$_id.month', 8] }, then: 'Aug' },
                { case: { $eq: ['$_id.month', 9] }, then: 'Sep' },
                { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
                { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
                { case: { $eq: ['$_id.month', 12] }, then: 'Dec' },
              ],
              default: '',
            },
          },
          coins: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ];

    return RewardTransaction.aggregate(pipeline);
  }

  /**
   * Get badges awarded
   */
  async getBadgesAwarded(dateRange = null) {
    const matchStage = { isDeleted: false };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'earnedAt', {}));
    }

    const result = await UserBadge.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]);

    return result[0]?.total || 0;
  }

  /**
   * Get achievements awarded
   */
  async getAchievementsAwarded(dateRange = null) {
    const matchStage = { isDeleted: false, completed: true };

    if (dateRange) {
      Object.assign(matchStage, this._buildDateFilter(dateRange, 'completedAt', {}));
    }

    const result = await UserAchievement.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]);

    return result[0]?.total || 0;
  }

  /**
   * Get all reward analytics
   */
  async getRewardAnalytics(dateRange = null) {
    const [coinsDistributed, coinsByMonth, badgesAwarded, achievementsAwarded] = await Promise.all([
      this.getCoinsDistributed(dateRange),
      this.getCoinsEarnedByMonth(dateRange),
      this.getBadgesAwarded(dateRange),
      this.getAchievementsAwarded(dateRange),
    ]);

    return {
      coinsDistributed,
      coinsEarnedByMonth: coinsByMonth,
      badgesAwarded,
      achievementsAwarded,
    };
  }

  // ============================================================
  // LEADERBOARD ANALYTICS
  // ============================================================

  /**
   * Get top volunteers by hours
   */
  async getTopVolunteersByHours(limit = 10) {
    const pipeline = [
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$user',
          totalHours: { $sum: '$totalHours' },
        },
      },
      { $sort: { totalHours: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          totalHours: 1,
        },
      },
    ];

    return Attendance.aggregate(pipeline);
  }

  /**
   * Get top volunteers by coins
   */
  async getTopVolunteersByCoins(limit = 10) {
    const pipeline = [
      { $match: { isDeleted: false, role: 'volunteer' } },
      { $sort: { coins: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$name',
          email: '$email',
          coins: 1,
        },
      },
    ];

    return User.aggregate(pipeline);
  }

  /**
   * Get most active volunteers (by programs joined)
   */
  async getMostActiveVolunteers(limit = 10) {
    const pipeline = [
      { $match: { isDeleted: false, role: 'volunteer' } },
      { $sort: { programsJoined: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$name',
          email: '$email',
          programsJoined: 1,
        },
      },
    ];

    return User.aggregate(pipeline);
  }

  /**
   * Get all leaderboard analytics
   */
  async getLeaderboardAnalytics(limit = 10) {
    const [topByHours, topByCoins, mostActive] = await Promise.all([
      this.getTopVolunteersByHours(limit),
      this.getTopVolunteersByCoins(limit),
      this.getMostActiveVolunteers(limit),
    ]);

    return {
      topVolunteers: topByHours,
      highestCoinEarners: topByCoins,
      mostActiveVolunteers: mostActive,
    };
  }

  // ============================================================
  // ORGANIZATION ANALYTICS
  // ============================================================

  /**
   * Get organization analytics
   */
  async getOrganizationAnalytics(_dateRange = null) {
    const [totalOrganizations, verifiedOrganizations, activeOrganizations] = await Promise.all([
      Organization.countDocuments({ isDeleted: false }),
      Organization.countDocuments({ verificationStatus: 'verified', isDeleted: false }),
      Organization.countDocuments({ isActive: true, isDeleted: false }),
    ]);

    return {
      organizationsCreated: totalOrganizations,
      verifiedOrganizations,
      activeOrganizations,
    };
  }

  // ============================================================
  // DASHBOARD STATISTICS (Module 11.1)
  // ============================================================

/**
    * Get volunteer dashboard statistics
    * @param {string} userId - The volunteer user ID
    * @returns {Promise<object>} Volunteer statistics
    */
  async getVolunteerStats(userId) {
    const [
      totalProgramsJoined,
      activePrograms,
      completedPrograms,
      pendingApps,
      approvedApps,
      rejectedApps,
      totalAttendance,
      totalHoursAgg,
      unreadNotifications,
      certificatesCount,
      rewardsCount,
      badgesCount,
    ] = await Promise.all([
      Application.countDocuments({ user: userId, status: { $in: ['joined', 'approved', 'checked_in', 'checked_out', 'completed'] }, isDeleted: false }),
      Application.countDocuments({ user: userId, status: { $in: ['joined', 'approved', 'checked_in', 'checked_out', 'ongoing'] }, isDeleted: false }),
      Application.countDocuments({ user: userId, status: 'completed', isDeleted: false }),
      Application.countDocuments({ user: userId, status: { $in: ['applied', 'pending', 'under_review'] }, isDeleted: false }),
      Application.countDocuments({ user: userId, status: { $in: ['joined', 'approved', 'checked_in', 'checked_out', 'completed'] }, isDeleted: false }),
      Application.countDocuments({ user: userId, status: 'rejected', isDeleted: false }),
      Attendance.countDocuments({ user: userId, isDeleted: false }),
      Attendance.aggregate([
        { $match: { user: userId, isDeleted: false } },
        { $group: { _id: null, totalHours: { $sum: '$totalHours' } } },
      ]),
      Notification.countDocuments({ recipient: userId, isRead: false, isDeleted: false }),
      Certificate.countDocuments({ user: userId, status: 'issued', isDeleted: false }),
      RewardTransaction.countDocuments({ user: userId, isDeleted: false }),
      UserBadge.countDocuments({ user: userId, isDeleted: false }),
    ]);

    const user = await User.findById(userId).select('coins points volunteerLevel').lean();
    
    // Note: Rank has been decoupled and moved to its own high-performance endpoint.
    // It is no longer returned as part of this monolith payload to avoid blocking.
    // See getVolunteerRank() below.

    return {
      totalProgramsJoined,
      activePrograms,
      completedPrograms,
      pendingApplications: pendingApps,
      approvedApplications: approvedApps,
      rejectedApplications: rejectedApps,
      totalAttendance,
      totalHours: totalHoursAgg[0]?.totalHours || 0,
      currentCoins: user?.coins || 0,
      points: user?.points || 0,
      volunteerLevel: user?.volunteerLevel || 'Beginner',
      // Rank is now fetched via /analytics/dashboard/volunteer/rank
      rank: 0,
      unreadNotifications,
      certificatesEarned: certificatesCount,
      rewards: rewardsCount,
      badgesCount: badgesCount,
    };
  }

  /**
   * Get volunteer rank (O(1) indexed query)
   * @param {string} userId - The volunteer user ID
   * @returns {Promise<number>} Volunteer rank
   */
  async getVolunteerRank(userId) {
    const user = await User.findById(userId).select('coins').lean();
    if (!user) return 0;
    
    const userCoins = user.coins || 0;
    // Standard competition ranking: count how many active volunteers have strictly MORE coins.
    // E.g. if 5 people have more coins than you, your rank is 6.
    const [higherRankCount, totalVolunteers] = await Promise.all([
      User.countDocuments({
        role: 'volunteer',
        isDeleted: false,
        coins: { $gt: userCoins }
      }),
      User.countDocuments({
        role: 'volunteer',
        isDeleted: false,
        status: 'active'
      })
    ]);
    
    return { rank: higherRankCount + 1, totalVolunteers };
  }

  /**
   * Get admin dashboard statistics
   * @returns {Promise<object>} Admin statistics
   */
  async getAdminStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch lean collections concurrently
    const [
      users,
      programs,
      applications,
      attendances,
      certificates,
      rewardTransactions,
      organizations,
      badges,
      achievements
    ] = await Promise.all([
      User.find({ isDeleted: false }).select('role status createdAt state').lean(),
      Program.find({ isDeleted: false }).select('status').lean(),
      Application.find({ isDeleted: false }).select('status').lean(),
      Attendance.find({ isDeleted: false }).select('status attendanceDate checkInTime checkOutTime flaggedReason totalHours').lean(),
      Certificate.find({ status: 'issued', isDeleted: false }).select('_id').lean(),
      RewardTransaction.find({ isDeleted: false, coins: { $gt: 0 } }).select('coins').lean(),
      Organization.find({ isDeleted: false }).select('verificationStatus').lean(),
      UserBadge.find({ isDeleted: false }).select('_id').lean(),
      UserAchievement.find({ isDeleted: false, completed: true }).select('_id').lean(),
    ]);

    // Compute User Stats & Charts
    let totalVolunteers = 0, activeVolunteers = 0, newVolunteersThisMonth = 0;
    const joinedPerMonthMap = new Map();
    const stateDistributionMap = new Map();

    for (const u of users) {
      if (u.role === 'volunteer') {
        totalVolunteers++;
        if (u.status === 'active') activeVolunteers++;
        
        if (u.createdAt) {
          const created = new Date(u.createdAt);
          if (created >= startOfMonth) newVolunteersThisMonth++;

          // for getVolunteersJoinedPerMonth
          const year = created.getFullYear();
          const month = created.getMonth() + 1;
          const key = `${year}-${month}`;
          if (!joinedPerMonthMap.has(key)) {
            joinedPerMonthMap.set(key, { year, month, count: 0 });
          }
          joinedPerMonthMap.get(key).count++;
        }

        // for getVolunteersByState
        if (u.state && typeof u.state === 'string' && u.state.trim() !== '') {
          const st = u.state;
          stateDistributionMap.set(st, (stateDistributionMap.get(st) || 0) + 1);
        }
      }
    }

    // Compute Programs
    let totalPrograms = 0, activePrograms = 0, draftPrograms = 0, completedPrograms = 0, cancelledPrograms = 0;
    for (const p of programs) {
      totalPrograms++;
      if (['published', 'ongoing', 'registration_closed'].includes(p.status)) activePrograms++;
      else if (p.status === 'draft') draftPrograms++;
      else if (p.status === 'completed') completedPrograms++;
      else if (p.status === 'cancelled') cancelledPrograms++;
    }

    // Compute Applications
    let totalApplications = 0, pendingApplications = 0, approvedApplications = 0, rejectedApplications = 0;
    for (const a of applications) {
      totalApplications++;
      if (['applied', 'pending', 'under_review'].includes(a.status)) pendingApplications++;
      else if (['joined', 'approved', 'checked_in', 'checked_out', 'completed'].includes(a.status)) approvedApplications++;
      else if (a.status === 'rejected') rejectedApplications++;
    }

    // Compute Attendances
    let totalAttendance = 0, presentAttendance = 0, todaysAttendance = 0;
    let liveCheckedInCount = 0, todaysFlaggedCount = 0, hoursServed = 0;
    
    for (const a of attendances) {
      totalAttendance++;
      if (a.status === 'present') presentAttendance++;
      
      let isToday = false;
      if (a.attendanceDate) {
        const ad = new Date(a.attendanceDate);
        if (ad >= today && ad < tomorrow) isToday = true;
      }

      if (isToday) todaysAttendance++;
      if (a.checkInTime && !a.checkOutTime) liveCheckedInCount++;
      if (isToday && a.flaggedReason) todaysFlaggedCount++;
      
      hoursServed += (a.totalHours || 0);
    }

    // Compute Organizations
    let totalOrganizations = 0, verifiedOrganizations = 0, pendingOrganizations = 0;
    for (const o of organizations) {
      totalOrganizations++;
      if (o.verificationStatus === 'verified') verifiedOrganizations++;
      else if (o.verificationStatus === 'pending') pendingOrganizations++;
    }

    // Compute Rewards
    let coinsDistributed = 0;
    for (const r of rewardTransactions) coinsDistributed += (r.coins || 0);

    // Format Charts
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const volunteersJoinedPerMonth = Array.from(joinedPerMonthMap.values())
      .sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year)
      .map(item => ({ ...item, monthName: months[item.month] || '' }));

    const stateDistribution = Array.from(stateDistributionMap.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);

    return {
      users: {
        totalVolunteers,
        activeVolunteers,
        newVolunteersThisMonth,
      },
      programs: {
        totalPrograms,
        activePrograms,
        draftPrograms,
        completedPrograms,
        cancelledPrograms,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
      },
      attendance: {
        totalAttendance,
        todaysAttendance,
        attendanceRate: calculatePercentage(presentAttendance, totalAttendance),
        hoursServed,
        liveCheckedInCount,
        todaysFlaggedCount,
      },
      certificates: {
        generated: certificates.length,
      },
      rewards: {
        coinsDistributed,
        coinsIssued: coinsDistributed,
        badgesAwarded: badges.length,
        achievementsAwarded: achievements.length,
      },
      organizations: {
        totalOrganizations,
        verifiedOrganizations,
        pendingOrganizations,
      },
      volunteersJoinedPerMonth,
      stateDistribution,
    };
  }

  /**
   * Get super admin dashboard statistics
   * @returns {Promise<object>} Super admin statistics
   */
  async getSuperAdminStats() {
    const adminStats = await this.getAdminStats();

    const [totalAdmins, totalRoles, totalPermissions] = await Promise.all([
      User.countDocuments({ role: { $in: ['admin', 'superadmin'] }, isDeleted: false }),
      Role.countDocuments({ isDeleted: false }),
      Permission.countDocuments({ isDeleted: false }),
    ]);

    // Platform version from environment or package.json (simulated)
    const platformVersion = process.env.PLATFORM_VERSION || '1.0.0';

    // Database health check - basic connection status
    let dbHealth = 'healthy';
    try {
      await User.findOne({}).limit(1).lean();
    } catch (_error) {
      dbHealth = 'unhealthy';
    }

    return {
      ...adminStats,
      platform: {
        version: platformVersion,
        dbHealth,
        totalAdmins,
        totalRoles,
        totalPermissions,
      },
    };
  }
}

module.exports = new AnalyticsRepository();