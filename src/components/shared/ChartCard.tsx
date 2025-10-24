import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MoreVertical, Maximize2, Download, FileDown } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }[];
  isLoading?: boolean;
  error?: string;
  isEmpty?: boolean;
  enableFullscreen?: boolean;
  onDownloadImage?: () => void;
  onDownloadData?: () => void;
}

export function ChartCard({
  title,
  subtitle,
  icon,
  children,
  actions = [],
  isLoading,
  error,
  isEmpty,
  enableFullscreen = true,
  onDownloadImage,
  onDownloadData,
}: ChartCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          {subtitle && <Skeleton className="h-4 w-64 mt-2" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const content = (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <CardTitle>{title}</CardTitle>
              {subtitle && <CardDescription className="mt-1">{subtitle}</CardDescription>}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {enableFullscreen && (
                <DropdownMenuItem onClick={() => setIsFullscreen(true)}>
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Tela cheia
                </DropdownMenuItem>
              )}
              {onDownloadImage && (
                <DropdownMenuItem onClick={onDownloadImage}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar imagem
                </DropdownMenuItem>
              )}
              {onDownloadData && (
                <DropdownMenuItem onClick={onDownloadData}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Baixar dados
                </DropdownMenuItem>
              )}
              {actions.map((action, i) => (
                <DropdownMenuItem key={i} onClick={action.onClick}>
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  if (!enableFullscreen) {
    return content;
  }

  return (
    <>
      {content}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {icon}
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
            <div className="min-h-[60vh]">{children}</div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
