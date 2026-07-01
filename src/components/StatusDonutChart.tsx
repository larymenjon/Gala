import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { EventMetrics } from '../types';

export default function StatusDonutChart({ metrics }: { metrics: EventMetrics }) {
  const data = [
    { name: 'Confirmados', value: metrics.totalConfirmations, color: '#8FA68E' },
    { name: 'Pendentes', value: metrics.totalPending, color: '#C8A24A' },
    { name: 'Recusados', value: metrics.totalDeclined, color: '#C16E5A' },
  ];
  const hasData = metrics.totalInvites > 0;

  return (
    <div className="bg-white rounded-2xl border border-ink/8 p-5 shadow-soft">
      <p className="text-xs font-medium text-ink/45 uppercase tracking-wide mb-2">Status dos convites</p>
      {!hasData ? (
        <div className="h-48 flex items-center justify-center text-sm text-ink/35">Nenhum convidado cadastrado ainda</div>
      ) : (
        <div className="h-48 flex items-center">
          <ResponsiveContainer width="60%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2.5">
            {data.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink/60">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-medium text-ink">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
