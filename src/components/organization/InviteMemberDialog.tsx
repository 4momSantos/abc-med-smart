import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useOrganizationStore } from '@/store/organizationStore';
import type { OrgRole } from '@/types/organization';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrgRole>('org_viewer');
  const { inviteMember } = useOrganizationStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    await inviteMember(email.trim(), role);
    setEmail('');
    setRole('org_viewer');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Convidar Membro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar Novo Membro</DialogTitle>
          <DialogDescription>
            Envie um convite para um novo membro da organização.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select value={role} onValueChange={(value) => setRole(value as OrgRole)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="org_viewer">Visualizador</SelectItem>
                <SelectItem value="org_manager">Gestor</SelectItem>
                <SelectItem value="org_admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === 'org_viewer' && 'Pode apenas visualizar dados'}
              {role === 'org_manager' && 'Pode editar dados e configurações'}
              {role === 'org_admin' && 'Controle total da organização'}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!email.trim()}>
              Enviar Convite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
