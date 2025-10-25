import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportTemplate, ReportData, ReportSection } from '@/types/reports';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export class PDFReportGenerator {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageHeight: number;
  private pageWidth: number;
  private margins: { top: number; bottom: number; left: number; right: number };
  private template: ReportTemplate;
  private data: ReportData;

  constructor(template: ReportTemplate, data: ReportData) {
    this.template = template;
    this.data = data;
    
    const orientation = template.layout.orientation === 'landscape' ? 'l' : 'p';
    const format = template.layout.pageSize === 'Letter' ? 'letter' : 'a4';
    
    this.pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.margins = template.layout.margins;
    this.currentY = this.margins.top;
  }

  async generate(): Promise<jsPDF> {
    // Add header
    this.addHeader();

    // Process sections
    for (const section of this.template.sections) {
      await this.renderSection(section);
    }

    // Add footer to all pages
    if (this.template.options.includeFooter) {
      this.addFooterToAllPages();
    }

    return this.pdf;
  }

  private addHeader() {
    const { title, subtitle, headerColor } = this.template.branding;

    // Header background
    this.pdf.setFillColor(headerColor);
    this.pdf.rect(0, 0, this.pageWidth, 40, 'F');

    // Title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margins.left, 20);

    // Subtitle
    if (subtitle) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(subtitle, this.margins.left, 30);
    }

    // Timestamp
    if (this.template.options.includeTimestamp) {
      this.pdf.setFontSize(10);
      const timestamp = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      this.pdf.text(`Gerado em: ${timestamp}`, this.pageWidth - this.margins.right - 50, 20);
    }

    this.currentY = 50;
  }

  private async renderSection(section: ReportSection) {
    switch (section.type) {
      case 'header':
        this.addSectionHeader(section.title, section.subtitle);
        break;
      case 'kpis':
        this.addKPIs(section.columns, section.selectedKpis);
        break;
      case 'abc_chart':
        await this.addChart('abc-chart-container', section.height);
        break;
      case 'abc_table':
        this.addABCTable(section.maxRows, section.columns);
        break;
      case 'statistics':
        this.addStatistics();
        break;
      case 'insights':
        this.addInsights(section.maxItems);
        break;
      case 'text':
        this.addText(section.content);
        break;
      case 'page_break':
        this.addPage();
        break;
      case 'anomalies':
        this.addAnomalies(section.threshold);
        break;
    }
  }

  private addSectionHeader(title: string, subtitle?: string) {
    this.checkPageBreak(20);

    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margins.left, this.currentY);
    this.currentY += 8;

    if (subtitle) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(subtitle, this.margins.left, this.currentY);
      this.currentY += 6;
    }

    this.currentY += 5;
  }

  private addKPIs(columns: number, selectedKpis: string[]) {
    this.checkPageBreak(40);

    const kpiWidth = (this.pageWidth - this.margins.left - this.margins.right - (columns - 1) * 5) / columns;
    const kpiHeight = 25;

    const kpiData: Record<string, { label: string; value: string; color: string }> = {
      totalItems: {
        label: 'Total de Itens',
        value: this.data.kpis.totalItems.toString(),
        color: '#3b82f6'
      },
      totalValue: {
        label: 'Valor Total',
        value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(this.data.kpis.totalValue),
        color: '#10b981'
      },
      classA: {
        label: 'Classe A',
        value: `${this.data.kpis.classA.count} (${this.data.kpis.classA.percentage.toFixed(1)}%)`,
        color: '#ef4444'
      },
      classB: {
        label: 'Classe B',
        value: `${this.data.kpis.classB.count} (${this.data.kpis.classB.percentage.toFixed(1)}%)`,
        color: '#f59e0b'
      },
      classC: {
        label: 'Classe C',
        value: `${this.data.kpis.classC.count} (${this.data.kpis.classC.percentage.toFixed(1)}%)`,
        color: '#8b5cf6'
      },
      avgValue: {
        label: 'Valor Médio',
        value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          this.data.kpis.totalValue / this.data.kpis.totalItems
        ),
        color: '#06b6d4'
      }
    };

    let x = this.margins.left;
    selectedKpis.slice(0, columns).forEach((kpiKey) => {
      const kpi = kpiData[kpiKey];
      if (!kpi) return;

      // KPI box background
      this.pdf.setFillColor(250, 250, 250);
      this.pdf.rect(x, this.currentY, kpiWidth, kpiHeight, 'F');

      // KPI border
      this.pdf.setDrawColor(200, 200, 200);
      this.pdf.rect(x, this.currentY, kpiWidth, kpiHeight, 'S');

      // KPI label
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(kpi.label, x + 5, this.currentY + 8);

      // KPI value
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(kpi.value, x + 5, this.currentY + 18);

      x += kpiWidth + 5;
    });

    this.currentY += kpiHeight + 10;
  }

  private async addChart(elementId: string, height: number) {
    this.checkPageBreak(height + 10);

    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Chart element ${elementId} not found`);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = this.pageWidth - this.margins.left - this.margins.right;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      this.pdf.addImage(
        imgData,
        'PNG',
        this.margins.left,
        this.currentY,
        imgWidth,
        Math.min(imgHeight, height)
      );

      this.currentY += Math.min(imgHeight, height) + 10;
    } catch (error) {
      console.error('Error capturing chart:', error);
    }
  }

  private addABCTable(maxRows: number = 20, columns: string[]) {
    this.checkPageBreak(60);

    const items = this.data.items
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, maxRows);

    // Table header
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.rect(this.margins.left, this.currentY, this.pageWidth - this.margins.left - this.margins.right, 8, 'F');

    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);

    const colWidth = (this.pageWidth - this.margins.left - this.margins.right) / columns.length;
    
    columns.forEach((col, i) => {
      const labels: Record<string, string> = {
        code: 'Código',
        name: 'Nome',
        classification: 'Classe',
        quantity: 'Qtd',
        unitPrice: 'Preço Unit.',
        totalValue: 'Valor Total',
        percentage: '%',
        cumulativePercentage: '% Acum.'
      };
      this.pdf.text(labels[col] || col, this.margins.left + i * colWidth + 2, this.currentY + 6);
    });

    this.currentY += 10;

    // Table rows
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);

    items.forEach((item, index) => {
      this.checkPageBreak(8);

      if (index % 2 === 0) {
        this.pdf.setFillColor(250, 250, 250);
        this.pdf.rect(this.margins.left, this.currentY, this.pageWidth - this.margins.left - this.margins.right, 7, 'F');
      }

      columns.forEach((col, i) => {
        let value = '';
        
        switch (col) {
          case 'code':
            value = item.code || '-';
            break;
          case 'name':
            value = item.name.substring(0, 30);
            break;
          case 'classification':
            value = item.classification || '-';
            break;
          case 'quantity':
            value = item.quantity.toString();
            break;
          case 'unitPrice':
            value = `R$ ${item.unitPrice.toFixed(2)}`;
            break;
          case 'totalValue':
            value = `R$ ${item.totalValue.toFixed(2)}`;
            break;
        }

        this.pdf.text(value, this.margins.left + i * colWidth + 2, this.currentY + 5);
      });

      this.currentY += 7;
    });

    this.currentY += 5;
  }

  private addStatistics() {
    this.checkPageBreak(40);

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Estatísticas Gerais', this.margins.left, this.currentY);
    this.currentY += 8;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    const stats = [
      `Total de Itens: ${this.data.items.length}`,
      `Valor Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(this.data.kpis.totalValue)}`,
      `Período: ${format(this.data.period.start, 'dd/MM/yyyy')} a ${format(this.data.period.end, 'dd/MM/yyyy')}`
    ];

    stats.forEach(stat => {
      this.pdf.text(stat, this.margins.left, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;
  }

  private addInsights(maxItems: number) {
    this.checkPageBreak(40);

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Insights e Recomendações', this.margins.left, this.currentY);
    this.currentY += 8;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    const insights = [
      'Concentre esforços de gestão nos itens Classe A',
      'Revise políticas de estoque para itens Classe B',
      'Considere gestão simplificada para itens Classe C',
      'Monitore itens com alto valor unitário',
      'Avalie oportunidades de consolidação de fornecedores'
    ].slice(0, maxItems);

    insights.forEach((insight, index) => {
      this.checkPageBreak(8);
      this.pdf.text(`${index + 1}. ${insight}`, this.margins.left, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;
  }

  private addText(content: string) {
    this.checkPageBreak(20);

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(60, 60, 60);

    const maxWidth = this.pageWidth - this.margins.left - this.margins.right;
    const lines = this.pdf.splitTextToSize(content, maxWidth);

    lines.forEach((line: string) => {
      this.checkPageBreak(6);
      this.pdf.text(line, this.margins.left, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 5;
  }

  private addAnomalies(threshold: number) {
    this.checkPageBreak(40);

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(239, 68, 68);
    this.pdf.text('⚠ Anomalias Detectadas', this.margins.left, this.currentY);
    this.currentY += 10;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Nenhuma anomalia crítica detectada no momento.', this.margins.left, this.currentY);
    this.currentY += 10;
  }

  private addFooterToAllPages() {
    const pageCount = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      
      // Footer line
      this.pdf.setDrawColor(200, 200, 200);
      this.pdf.line(
        this.margins.left,
        this.pageHeight - this.margins.bottom + 5,
        this.pageWidth - this.margins.right,
        this.pageHeight - this.margins.bottom + 5
      );

      // Footer text
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(100, 100, 100);
      
      if (this.template.options.footerText) {
        this.pdf.text(
          this.template.options.footerText,
          this.margins.left,
          this.pageHeight - this.margins.bottom + 10
        );
      }

      // Page number
      if (this.template.options.includePageNumbers) {
        this.pdf.text(
          `Página ${i} de ${pageCount}`,
          this.pageWidth - this.margins.right - 20,
          this.pageHeight - this.margins.bottom + 10
        );
      }
    }
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margins.bottom - 15) {
      this.addPage();
    }
  }

  private addPage() {
    this.pdf.addPage();
    this.currentY = this.margins.top;
  }

  download(filename: string) {
    this.pdf.save(filename);
  }
}
