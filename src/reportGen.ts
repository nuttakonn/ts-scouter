import * as fs from 'fs';
import path from 'path';

interface EvaluatedLead {
  brand_name: string;
  category: string;
  kiosk_potential_score: number;
  reason: string;
  is_new_opening: boolean;
  found_at_mall: string;
  source_url: string;
}

export async function generateHtmlReport(leads: EvaluatedLead[], outputPath: string): Promise<void> {
  // Sort by score descending
  const sortedLeads = [...leads].sort((a, b) => b.kiosk_potential_score - a.kiosk_potential_score);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TS Scouter - Kiosk Potential Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
        <header class="mb-8 flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-indigo-600">TS Scouter Report</h1>
                <p class="text-gray-600">New Store & Kiosk Leads Discovery</p>
            </div>
            <div class="text-right">
                <p class="text-sm text-gray-500 italic">Generated on: ${new Date().toLocaleString()}</p>
                <p class="text-sm font-semibold">Total Leads: ${sortedLeads.length}</p>
            </div>
        </header>

        <div class="bg-white shadow-lg rounded-xl overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand / Category</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mall</th>
                        <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider text-nowrap">Kiosk Score</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Findings & Reason</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${sortedLeads.map(lead => `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4">
                            <div class="text-sm font-bold text-gray-900">${lead.brand_name}</div>
                            <div class="text-xs text-gray-500">${lead.category}</div>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-600">
                            ${lead.found_at_mall}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getScoreClass(lead.kiosk_potential_score)}">
                                ${lead.kiosk_potential_score}%
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <p class="text-xs text-gray-700 leading-relaxed max-w-md">${lead.reason}</p>
                            <a href="${lead.source_url}" target="_blank" class="text-indigo-500 hover:text-indigo-700 text-[10px] mt-1 inline-block underline">View Source</a>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            ${lead.is_new_opening 
                                ? '<span class="px-2 py-1 text-[10px] font-semibold bg-green-100 text-green-800 rounded">NEW OPENING</span>' 
                                : '<span class="px-2 py-1 text-[10px] font-semibold bg-gray-100 text-gray-400 rounded">EXISTING</span>'}
                        </td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <footer class="mt-8 text-center text-gray-400 text-xs">
            Powered by TS Scouter & Gemini AI
        </footer>
    </div>
</body>
</html>
  `;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Report generated successfully at: ${outputPath}`);
}

function getScoreClass(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 border border-green-200';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  return 'bg-red-100 text-red-800 border border-red-200';
}
