import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Shield, X, CheckCircle } from "lucide-react";
import { useAdminContributions } from "../../hooks/useAdminContributions";
import ContributionQueue from "../../components/admin/contributions/ContributionQueue";
import AdminContributionDetail from "../../components/admin/contributions/AdminContributionDetail";
import ReviewPanel from "../../components/admin/contributions/ReviewPanel";
import ReviewStats from "../../components/admin/contributions/ReviewStats";

export default function AdminReviewDashboard() {
  const [selectedId, setSelectedId] = useState(null);

  const [reviewedIds, setReviewedIds] = useState(new Set());

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    sortBy: "createdAt",
  });

  const { data, isLoading, error, isFetching } = useAdminContributions({
    page: 1,
    limit: 12,
    search: searchQuery,
    status: filters.status,
    category: filters.category,
    sortBy: filters.sortBy,
  });

  const contributions = (data?.contributions || []).filter(
    (c) => !reviewedIds.has(c._id),
  );
  const contribution = contributions.find((c) => c._id === selectedId);

  const stats = useMemo(() => {
    const base = contributions || [];
    return {
      pending: base.filter((c) => c.status === "pending").length,
      underReview: base.filter((c) => c.status === "under_review").length,
      approvedToday: base.filter((c) => c.status === "approved").length,
      rejectedToday: base.filter((c) => c.status === "rejected").length,
      needsChanges: base.filter((c) => c.status === "needs_changes").length,
      featured: base.filter((c) => c.isFeatured).length,
      avgReviewTime: "2.4h",
    };
  }, [contributions]);

  const handleSelect = useCallback((contrib) => {
    setSelectedId(contrib._id);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleReviewed = useCallback((id) => {
    setReviewedIds((prev) => new Set([...prev, id]));
    setSelectedId(null);
  }, []);

  useEffect(() => {
    if (!isFetching && data?.contributions) {
      const serverIds = new Set(data.contributions.map((c) => c._id));
      setReviewedIds((prev) => {
        const stillPresent = [...prev].filter((id) => serverIds.has(id));
        return stillPresent.length < prev.size ? new Set(stillPresent) : prev;
      });
    }
  }, [isFetching, data]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-center text-red-600">
        <p className="text-sm mb-4">
          {error.message || "Failed to load contributions"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto w-full">
        <ReviewStats stats={stats} />

        <ContributionQueue
          contributions={contributions}
          loading={isLoading}
          onSelect={handleSelect}
          selectedId={selectedId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          detailPanel={
            selectedId ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full sticky top-20 relative">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 lg:hidden">
                  <button
                    onClick={handleBack}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors"
                  >
                    &larr; Back to List
                  </button>
                </div>

                <button
                  onClick={handleBack}
                  aria-label="Close panel"
                  className="hidden lg:flex"
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    zIndex: 50,
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>

                <div
                  style={{
                    padding: "1.5rem",
                    overflowY: "auto",
                    maxHeight: "calc(100vh - 140px)",
                  }}
                >
                  <AdminContributionDetail
                    contributionId={selectedId}
                    onBack={handleBack}
                  />
                  {contribution && (
                    <div
                      style={{
                        marginTop: "2rem",
                        paddingTop: "2rem",
                        borderTop: "1px solid #e2e8f0",
                      }}
                    >
                      <ReviewPanel
                        contribution={contribution}
                        onClose={handleBack}
                        onReviewed={handleReviewed}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "clamp(2rem, 5vw, 4rem)",
                  textAlign: "center",
                  color: "#64748b",
                  background: "#ffffff",
                  borderRadius: "1rem",
                  border: "2px dashed #e2e8f0",
                  minHeight: "400px",
                }}
              >
                {reviewedIds.size > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <CheckCircle
                      size={48}
                      style={{ color: "#16a34a", marginBottom: "1rem" }}
                    />
                    <h3
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        color: "#334155",
                      }}
                    >
                      Review submitted successfully.
                    </h3>
                    <p
                      style={{ margin: 0, fontSize: "1rem", color: "#64748b" }}
                    >
                      Select another contribution from the queue.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <Shield size={48} className="mb-4 text-slate-300" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                      Review Panel
                    </h3>
                    <p>
                      Select a contribution from the list to view its details
                      and take action.
                    </p>
                  </div>
                )}
              </div>
            )
          }
        />
      </div>
    </div>
  );
}
