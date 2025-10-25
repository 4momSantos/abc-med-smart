import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle2 } from 'lucide-react';

export default function FieldsDocPage() {
  const fieldGroups = [
    {
      group: "📦 Campos Básicos",
      description: "Campos essenciais para análise ABC",
      fields: [
        { name: "Nome", required: true, type: "Texto", example: "Dipirona 500mg", description: "Nome do medicamento ou material" },
        { name: "Quantidade", required: true, type: "Número", example: "100", description: "Quantidade consumida ou movimentada" },
        { name: "Preço Unitário", required: true, type: "Número", example: "2.50", description: "Preço unitário do item em R$" },
        { name: "Código", required: false, type: "Texto", example: "MED001", description: "Código de identificação do item" },
        { name: "Unidade", required: false, type: "Texto", example: "cx, un, fr", description: "Unidade de medida" },
      ]
    },
    {
      group: "🚚 Campos Logísticos",
      description: "Informações de estoque e fornecedores",
      fields: [
        { name: "Categoria", required: false, type: "Texto", example: "Medicamentos, Materiais", description: "Categoria principal do item" },
        { name: "Subcategoria", required: false, type: "Texto", example: "Analgésicos, Cirúrgicos", description: "Subcategoria ou grupo" },
        { name: "Fornecedor", required: false, type: "Texto", example: "Fornecedor A", description: "Nome do fornecedor" },
        { name: "Lead Time", required: false, type: "Número", example: "15", description: "Prazo de entrega em dias" },
        { name: "Estoque Atual", required: false, type: "Número", example: "500", description: "Quantidade em estoque" },
        { name: "Estoque Mínimo", required: false, type: "Número", example: "200", description: "Estoque mínimo desejado" },
        { name: "Ponto de Reposição", required: false, type: "Número", example: "300", description: "Ponto para disparar reposição" },
        { name: "Lote", required: false, type: "Texto", example: "L2025001", description: "Número do lote" },
        { name: "Validade", required: false, type: "Data", example: "31/12/2025", description: "Data de validade (DD/MM/AAAA)" },
      ]
    },
    {
      group: "📅 Campos Temporais",
      description: "Para análises de séries temporais",
      fields: [
        { name: "Data Movimentação", required: false, type: "Data", example: "15/01/2025", description: "Data da movimentação (DD/MM/AAAA)" },
        { name: "Mês", required: false, type: "Número", example: "1-12", description: "Mês da movimentação" },
        { name: "Ano", required: false, type: "Número", example: "2025", description: "Ano da movimentação" },
        { name: "Última Compra", required: false, type: "Data", example: "01/01/2025", description: "Data da última compra" },
        { name: "Frequência", required: false, type: "Texto", example: "Mensal, Trimestral", description: "Frequência de consumo" },
      ]
    },
    {
      group: "🏥 Campos Clínicos",
      description: "Informações clínicas e farmacológicas",
      fields: [
        { name: "Criticidade Clínica", required: false, type: "Texto", example: "Alta, Média, Baixa", description: "Criticidade para operação" },
        { name: "Indicação Terapêutica", required: false, type: "Texto", example: "Analgésico/Antipirético", description: "Indicação de uso" },
        { name: "Princípio Ativo", required: false, type: "Texto", example: "Dipirona Sódica", description: "Princípio ativo do medicamento" },
        { name: "Via Administração", required: false, type: "Texto", example: "Oral, IV, IM", description: "Via de administração" },
        { name: "Controle Especial", required: false, type: "Booleano", example: "Sim, Não", description: "Se requer controle especial" },
        { name: "Temperatura", required: false, type: "Texto", example: "15-25°C, 2-8°C", description: "Temperatura de armazenamento" },
      ]
    },
    {
      group: "💰 Campos Financeiros",
      description: "Informações de custos e valores",
      fields: [
        { name: "Custo Total", required: false, type: "Número", example: "250.00", description: "Custo total da movimentação" },
        { name: "Valor Estoque", required: false, type: "Número", example: "1250.00", description: "Valor do estoque atual" },
        { name: "Margem", required: false, type: "Número", example: "35", description: "Margem de lucro em %" },
        { name: "Desconto", required: false, type: "Número", example: "5", description: "Desconto aplicado em %" },
        { name: "Imposto", required: false, type: "Número", example: "18", description: "Imposto em %" },
      ]
    },
    {
      group: "🔧 Campos Operacionais",
      description: "Informações operacionais e administrativas",
      fields: [
        { name: "Setor Solicitante", required: false, type: "Texto", example: "Emergência, UTI", description: "Setor que solicitou" },
        { name: "Centro de Custo", required: false, type: "Texto", example: "CC-001", description: "Centro de custo" },
        { name: "Tipo Movimento", required: false, type: "Texto", example: "Entrada, Saída", description: "Tipo de movimentação" },
        { name: "Nota Fiscal", required: false, type: "Texto", example: "NF-2025-001", description: "Número da nota fiscal" },
        { name: "Responsável", required: false, type: "Texto", example: "João Silva", description: "Responsável pela movimentação" },
      ]
    },
    {
      group: "📊 Campos Analíticos",
      description: "Dados para análises avançadas",
      fields: [
        { name: "Sazonalidade", required: false, type: "Texto", example: "Alta, Baixa", description: "Nível de sazonalidade" },
        { name: "Tendência", required: false, type: "Texto", example: "Crescente, Estável", description: "Tendência de consumo" },
        { name: "Volatilidade", required: false, type: "Número", example: "0.15", description: "Volatilidade do consumo (0-1)" },
        { name: "Taxa Ruptura", required: false, type: "Número", example: "0.05", description: "Taxa de ruptura de estoque (0-1)" },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Documentação de Campos</h1>
        <p className="text-muted-foreground mt-2">
          Referência completa de todos os campos disponíveis para importação
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <CardTitle>Campos Disponíveis</CardTitle>
          </div>
          <CardDescription>
            O sistema suporta mais de 40 campos diferentes. Apenas <strong>Nome</strong>, <strong>Quantidade</strong> e <strong>Preço Unitário</strong> são obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {fieldGroups.map((group, idx) => (
            <div key={idx} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {group.group}
                </h3>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Campo</TableHead>
                      <TableHead className="w-[100px]">Tipo</TableHead>
                      <TableHead className="w-[150px]">Exemplo</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.fields.map((field, fieldIdx) => (
                      <TableRow key={fieldIdx}>
                        <TableCell className="font-medium">
                          {field.name}
                          {field.required && (
                            <Badge variant="destructive" className="ml-2">Obrigatório</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{field.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {field.example}
                        </TableCell>
                        <TableCell className="text-sm">{field.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formatos Aceitos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Datas</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Formato brasileiro: DD/MM/AAAA (ex: 31/12/2025)</li>
              <li>Formato ISO: AAAA-MM-DD (ex: 2025-12-31)</li>
              <li>Números seriais do Excel são convertidos automaticamente</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Números</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Decimais com vírgula (2,50) ou ponto (2.50)</li>
              <li>Símbolos de moeda (R$) são removidos automaticamente</li>
              <li>Espaços são ignorados</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Booleanos</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Verdadeiro: "Sim", "Yes", "True", "1", "S", "Y"</li>
              <li>Falso: "Não", "No", "False", "0", "N"</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <CardTitle>Dicas de Importação</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✅ Comece com os campos básicos e adicione mais informações gradualmente</p>
          <p>✅ Use templates pré-configurados para facilitar a importação</p>
          <p>✅ Campos opcionais podem ser deixados em branco</p>
          <p>✅ Quanto mais campos você mapear, mais análises avançadas estarão disponíveis</p>
          <p>✅ O sistema detecta automaticamente a maioria dos campos</p>
        </CardContent>
      </Card>
    </div>
  );
}
