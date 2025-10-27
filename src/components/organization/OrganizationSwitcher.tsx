import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { useOrganizationStore } from '@/store/organizationStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function OrganizationSwitcher() {
  const { organizations, currentOrganization, setCurrentOrganization } = useOrganizationStore();

  if (!currentOrganization) return null;

  // Se só tem uma organização, mostra só o nome
  if (organizations.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{currentOrganization.name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Building2 className="h-4 w-4" />
          <span className="max-w-[150px] truncate">{currentOrganization.name}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => setCurrentOrganization(org.id)}
            className="cursor-pointer"
          >
            <Check
              className={cn(
                'mr-2 h-4 w-4',
                currentOrganization.id === org.id ? 'opacity-100' : 'opacity-0'
              )}
            />
            <span className="truncate">{org.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
