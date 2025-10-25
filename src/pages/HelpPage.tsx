import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BookOpen, HelpCircle, Mail, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ajuda e Suporte</h1>
        <p className="text-muted-foreground mt-2">
          Encontre respostas para suas dúvidas e aprenda a usar o sistema
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <CardTitle>Documentação de Campos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Referência completa de todos os campos disponíveis
            </p>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/fields-doc'}>
              Ver Campos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              <CardTitle>Tutoriais em Vídeo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Aprenda com vídeos passo a passo
            </p>
            <Button variant="outline" className="w-full">
              Assistir Tutoriais
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <CardTitle>Contato</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Entre em contato com o suporte
            </p>
            <Button variant="outline" className="w-full">
              Enviar Mensagem
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
          <CardDescription>
            Respostas rápidas para as dúvidas mais comuns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>O que é a Curva ABC?</AccordionTrigger>
              <AccordionContent>
                A Curva ABC é uma ferramenta de gestão que classifica itens de acordo com sua
                importância. A Classe A representa os itens mais importantes (geralmente 20% dos
                itens que representam 80% do valor), Classe B são itens de importância
                intermediária, e Classe C são os itens de menor impacto.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Como importar meus dados?</AccordionTrigger>
              <AccordionContent>
                Vá até a página "Importar Dados" e faça upload de um arquivo Excel (.xlsx, .xls)
                ou CSV. O sistema detecta automaticamente mais de 40 campos diferentes incluindo:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Básicos:</strong> Nome, Quantidade, Preço (obrigatórios)</li>
                  <li><strong>Logísticos:</strong> Categoria, Fornecedor, Lead Time, Estoque</li>
                  <li><strong>Temporais:</strong> Data Movimentação, Mês, Ano</li>
                  <li><strong>Clínicos:</strong> Indicação Terapêutica, Princípio Ativo, Via Administração</li>
                  <li><strong>Financeiros:</strong> Custo Total, Margem, Desconto, Impostos</li>
                  <li><strong>Operacionais:</strong> Setor, Centro de Custo, Tipo Movimento</li>
                </ul>
                <p className="mt-2">Apenas 3 campos são obrigatórios: Nome, Quantidade e Preço Unitário. 
                Quanto mais campos você mapear, mais análises avançadas estarão disponíveis.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>O que são anomalias?</AccordionTrigger>
              <AccordionContent>
                Anomalias são itens que apresentam comportamento atípico em relação ao padrão do
                conjunto de dados. Por exemplo, um item com valor muito acima ou abaixo da média,
                ou com alta criticidade clínica mas baixo valor financeiro. O sistema usa
                algoritmos de Machine Learning para detectar automaticamente esses casos.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Como funcionam os filtros?</AccordionTrigger>
              <AccordionContent>
                Use a barra de filtros no topo das páginas para refinar sua análise. Você pode
                filtrar por classe ABC, buscar por nome ou ID, e definir faixas de valor. Os
                filtros são aplicados em tempo real e afetam todos os gráficos e tabelas da página.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Meus dados estão seguros?</AccordionTrigger>
              <AccordionContent>
                Sim. Todos os dados são processados localmente no seu navegador. Nenhuma informação
                é enviada para servidores externos. Os dados são armazenados apenas no seu
                dispositivo e você pode limpá-los a qualquer momento nas Configurações.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versão:</span>
              <span className="font-medium">2.0.0 (Release 2 + Expansão Completa)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última atualização:</span>
              <span className="font-medium">Outubro 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campos suportados:</span>
              <span className="font-medium">40+ campos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Licença:</span>
              <span className="font-medium">Proprietária</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
