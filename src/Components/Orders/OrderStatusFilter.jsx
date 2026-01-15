import { Search } from "lucide-react";
import "./OrderStatusFilter.scss";

const STATE_LABELS = {
    requested: "Requested",
    Declined: "Declined",
    active: "Active",
    delivered: "Delivered",
    completed: "Completed",
    "request-cancellation": "Cancel Requested",
    cancelled: "Cancelled",
    revision: "Revision"
};

const PRIORITY_ORDER = [
    "requested",
    "active",
    "delivered",
    "completed",
    "Declined",
    "revision",
    "request-cancellation",
    "cancelled"
];

const MAX_TABS = 4;

export default function OrderStatusFilter({
    orders = [],
    selectedStatus,
    onChange,
    searchQuery,
    onSearchChange
}) {
    /* -----------------------------
       1. Count existing statuses
    ----------------------------- */
    const stateCount = {};

    orders.forEach(order => {
        if (order?.status) {
            stateCount[order.status] =
                (stateCount[order.status] || 0) + 1;
        }
    });

    /* -----------------------------
       2. Keep only existing states
    ----------------------------- */
    const existingStates = PRIORITY_ORDER.filter(
        state => stateCount[state]
    );

    /* -----------------------------
       3. Split into navbar + more
    ----------------------------- */
    const mainTabs = existingStates.slice(0, MAX_TABS);
    const overflowTabs = existingStates.slice(MAX_TABS);

    return (
        <>
            <div className="orders-navbar">

                <div className="order-filter">
                    {/* ALL */}
                    <button
                        className={`filter-tab ${selectedStatus === "all" ? "active" : ""
                            }`}
                        onClick={() => onChange("all")}
                    >
                        All
                    </button>

                    {/* MAIN TABS */}
                    {mainTabs.map(state => (
                        <button
                            key={state}
                            className={`filter-tab ${selectedStatus === state ? "active" : ""
                                }`}
                            onClick={() => onChange(state)}
                        >
                            {STATE_LABELS[state]}
                        </button>
                    ))}

                    {/* MORE DROPDOWN */}
                    {overflowTabs.length > 0 && (
                        <div className="filter-more">
                            <button className="filter-tab">More ▾</button>

                            <div className="more-menu">
                                {overflowTabs.map(state => (
                                    <div
                                        key={state}
                                        className={`more-item ${selectedStatus === state ? "active" : ""
                                            }`}
                                        onClick={() => onChange(state)}
                                    >
                                        {STATE_LABELS[state]}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="order-search-bar">
                    <div className="input-wrapper">
                        <Search className="input-icon" size={20}/>
                        <input
                            type="text"
                            placeholder="Search by gig title or order ID"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>

        </>
    );
}