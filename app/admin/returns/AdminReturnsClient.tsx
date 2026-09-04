'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { updateReturnStatus, deleteReturnRequest } from "./actions";

export default function AdminReturnsClient({ initialReturns }: { initialReturns: any[] }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div>
      {initialReturns.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          No return requests found.
        </div>
      ) : (
        <div className="space-y-6">
          {initialReturns.map((req) => (
            <div key={req.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <div>
                  <p className="text-xs text-gray-400">Return ID / Order ID</p>
                  <p className="font-mono text-xs text-gray-300">Return: {req.id}</p>
                  <p className="font-mono text-sm text-white">Order: {req.orderId}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border uppercase font-semibold ${
                  req.status === 'APPROVED' ? 'bg-green-950 text-green-400 border-green-800' :
                  req.status === 'REJECTED' ? 'bg-red-950 text-red-400 border-red-800' :
                  req.status === 'REFUNDED' ? 'bg-blue-950 text-blue-400 border-blue-800' :
                  'bg-yellow-950 text-yellow-400 border-yellow-800'
                }`}>
                  {req.status}
                </span>
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-lg p-4 space-y-2 text-sm">
                <p className="text-gray-400 text-xs font-semibold uppercase">Customer Reason:</p>
                <p className="text-gray-200 italic bg-black/60 p-3 rounded border border-gray-800">
                  "{req.reason}"
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-800">
                <span className="text-xs text-gray-400">
                  Requested on: {new Date(req.createdAt).toLocaleString()}
                </span>
                
                <div className="flex items-center gap-3">
                  <form action={updateReturnStatus} className="flex items-center gap-2">
                    <input type="hidden" name="returnId" value={req.id} />
                    <select
                      name="status"
                      defaultValue={req.status}
                      className="bg-black border border-gray-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-white hover:bg-gray-200 text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      Update
                    </button>
                  </form>

                  <form action={deleteReturnRequest}>
                    <input type="hidden" name="returnId" value={req.id} />
                    <button
                      type="submit"
                      className="bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}