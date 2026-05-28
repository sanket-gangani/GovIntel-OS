import { BriefingItem } from "./store";

function generateHeader(title: string): string {
  const date = new Date().toLocaleString();
  return `=================================================================\n${title.toUpperCase()}\n=================================================================\nGenerated: ${date}\nSystem: GovIntel OS - Local Inference\n=================================================================\n\n`;
}

export function generateTextExport(items: BriefingItem[], query: string): string {
  let content = generateHeader(`INVESTIGATION BRIEFING: ${query || "Custom Collection"}`);
  
  if (items.length === 0) {
    content += "No evidence collected in this briefing.\n";
    return content;
  }

  items.forEach((item, index) => {
    content += `EVIDENCE ITEM [${index + 1}]\n`;
    content += `Document: ${item.evidence.documentName}\n`;
    content += `Page: ${item.evidence.metadata?.page || 1}\n`;
    content += `Match Confidence: ${Math.round(item.evidence.score * 100)}%\n`;
    content += `\n[EXTRACTED TEXT]\n${item.evidence.text}\n`;
    
    if (item.note) {
      content += `\n[ANALYST NOTE]\n${item.note}\n`;
    }
    
    content += `\n-----------------------------------------------------------------\n\n`;
  });

  return content;
}

export function generateMarkdownExport(items: BriefingItem[], query: string): string {
  const date = new Date().toLocaleString();
  let content = `# INVESTIGATION BRIEFING: ${query || "Custom Collection"}\n\n`;
  content += `**Generated:** ${date}  \n**System:** GovIntel OS - Local Inference\n\n---\n\n`;
  
  if (items.length === 0) {
    content += "_No evidence collected in this briefing._\n";
    return content;
  }

  items.forEach((item, index) => {
    content += `### Evidence Item ${index + 1}\n`;
    content += `- **Document:** ${item.evidence.documentName}\n`;
    content += `- **Page:** ${item.evidence.metadata?.page || 1}\n`;
    content += `- **Match Confidence:** ${Math.round(item.evidence.score * 100)}%\n\n`;
    
    content += `> ${item.evidence.text.replace(/\n/g, "\n> ")}\n\n`;
    
    if (item.note) {
      content += `**Analyst Note:**\n_${item.note}_\n\n`;
    }
    
    content += `---\n\n`;
  });

  return content;
}

export function downloadFile(filename: string, content: string, type: "text/plain" | "text/markdown") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
