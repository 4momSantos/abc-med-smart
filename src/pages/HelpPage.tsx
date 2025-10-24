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
              <CardTitle>Documentação</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Guias completos sobre todas as funcionalidades
            </p>
            <Button variant="outline" className="w-full">
              Ver Documentação
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
                ou CSV contendo as colunas: nome do item, quantidade, valor unitário e criticidade
                clínica. O sistema irá detectar automaticamente as colunas e você poderá ajustar o
                mapeamento se necessário.
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
              <span className="font-medium">1.0.0 (Release 1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última atualização:</span>
              <span className="font-medium">Outubro 2025</span>
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
