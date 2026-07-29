const Program = require('./program.model');
const { PROGRAM_STATUS } = require('./program.constants');

const AUTOMATION_INTERVAL_MS = 60 * 1000; // 1 minute interval

class ProgramAutomation {
  constructor() {
    this.timer = null;
    this.isRunning = false;
  }

  start() {
    if (this.timer) return;
    // eslint-disable-next-line no-console
    console.log('[ProgramAutomation] 🚀 Program status date automation initialized (interval: 60s)');
    
    // Initial run after 5 seconds to let server boot up
    global.setTimeout(() => {
      this.tick();
    }, 5000);

    this.timer = global.setInterval(() => {
      this.tick();
    }, AUTOMATION_INTERVAL_MS);
  }

  stop() {
    if (this.timer) {
      global.clearInterval(this.timer);
      this.timer = null;
    }
  }

  async tick() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      await this.syncProgramStatuses();
      const programService = require('./program.service');
      await programService.broadcastUnbroadcastedPrograms();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ProgramAutomation] Error during program status sync tick:', err.message);
    } finally {
      this.isRunning = false;
    }
  }

  async syncProgramStatuses() {
    const now = new Date();

    // Query active non-terminal programs that are not deleted
    const activePrograms = await Program.find({
      isDeleted: false,
      status: {
        $in: [
          PROGRAM_STATUS.PUBLISHED,
          PROGRAM_STATUS.REGISTRATION_CLOSED,
          PROGRAM_STATUS.ONGOING,
        ],
      },
    }).lean();

    if (!activePrograms || activePrograms.length === 0) {
      return;
    }

    const programService = require('./program.service');

    for (const program of activePrograms) {
      let targetStatus = null;

      const endDate = program.endDate ? new Date(program.endDate) : null;
      const startDate = program.startDate ? new Date(program.startDate) : null;
      const regDeadline = program.registrationDeadline ? new Date(program.registrationDeadline) : null;

      const hasEndDate = endDate && !isNaN(endDate.getTime());
      const hasStartDate = startDate && !isNaN(startDate.getTime());
      const hasRegDeadline = regDeadline && !isNaN(regDeadline.getTime());

      // Rule 1: If endDate is set and now >= endDate -> COMPLETED
      if (hasEndDate && now >= endDate) {
        if (program.status !== PROGRAM_STATUS.COMPLETED) {
          targetStatus = PROGRAM_STATUS.COMPLETED;
        }
      }
      // Rule 2: Else if startDate is set and now >= startDate -> ONGOING
      else if (hasStartDate && now >= startDate) {
        if (program.status !== PROGRAM_STATUS.ONGOING) {
          targetStatus = PROGRAM_STATUS.ONGOING;
        }
      }
      // Rule 3: Else if registrationDeadline is set and now >= registrationDeadline -> REGISTRATION_CLOSED
      else if (hasRegDeadline && now >= regDeadline) {
        if (program.status === PROGRAM_STATUS.PUBLISHED) {
          targetStatus = PROGRAM_STATUS.REGISTRATION_CLOSED;
        }
      }

      if (targetStatus && targetStatus !== program.status) {
        try {
          const systemUserId = program.createdBy ? program.createdBy.toString() : null;
          await programService.changeProgramStatus(systemUserId, program._id.toString(), targetStatus);
          // eslint-disable-next-line no-console
          console.log(
            `[ProgramAutomation] ✅ Auto-updated program "${program.title}" (${program._id}) status from '${program.status}' to '${targetStatus}' based on set dates.`
          );
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(
            `[ProgramAutomation] Failed to transition program ${program._id} to ${targetStatus}:`,
            err.message
          );
        }
      }
    }
  }
}

const programAutomation = new ProgramAutomation();

module.exports = {
  programAutomation,
  initializeProgramAutomation: () => programAutomation.start(),
  syncProgramStatuses: () => programAutomation.syncProgramStatuses(),
};
