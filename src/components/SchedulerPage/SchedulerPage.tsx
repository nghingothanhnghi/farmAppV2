import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getSchedulerHealth } from "../../services/schedulerService";
import type { SchedulerHealth } from "../../models/interfaces/Scheduler";
import PageTitle from "../common/PageTitle";
import Badge from "../common/Badge";
import LinearProgress from "../common/LinearProgress";

const SchedulerPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [health, setHealth] = useState<SchedulerHealth | null>(null);

    const fetchHealth = async () => {
        try {
            const data = await getSchedulerHealth();
            setHealth(data);
        } catch (error) {
            console.error("Failed to fetch scheduler health", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
    }, []);

    if (loading) return (
        <LinearProgress
            position="absolute"
            thickness="h-1"
            duration={3000}
            message="Checking scheduler..."
        />
    );

    const chartData = [
        { status: "Running", count: health?.running_count || 0 },
        { status: "Stopped", count: health?.stopped_count || 0 },
    ];

    const barColors: Record<string, string> = {
        Running: "#16a34a", // green-600
        Stopped: "#dc2626", // red-600
    };

    return (
        <div>
            <PageTitle
                title="Scheduler Health"
            />
            <div className="bg-white rounded-lg shadow-md border border-gray-100 dark:bg-gray-900 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">
                            Overall Scheduler Status
                        </h3>
                        <small>Total Jobs: {health?.job_count}</small>
                    </div>
                    <div className="text-right flex gap-3">
                        <div className="flex gap-2">
                            <Badge label={`🟢 Running: ${health?.running_count}`} variant="success" />
                            <Badge label={`🔴 Stopped: ${health?.stopped_count}`} variant="danger" />
                        </div>
                    </div>
                </div>
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="status" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count">
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={barColors[entry.status] || "#8884d8"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {health?.jobs && health.jobs.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-100 mb-2">Scheduled Jobs</h4>
                        <ul className="space-y-2">
                            {health.jobs.map((job) => (
                                <li
                                    key={job.id}
                                    className="
                                        flex items-center justify-between
                                        rounded-xl px-4 py-3
                                      bg-gray-50 dark:bg-gray-800/80
                                        border border-gray-200 dark:border-gray-700
                                        shadow-sm hover:shadow-md
                                        hover:scale-[1.01] transition-all duration-200 ease-out
                                        backdrop-blur-sm
                                    "
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{job.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">ID: {job.id}</p>
                                    </div>
                                    <Badge
                                        label={job.status === "running" ? "Running" : "Stopped"}
                                        variant={job.status === "running" ? "success" : "danger"}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchedulerPage;
