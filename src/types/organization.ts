export type OrgRole = 'org_admin' | 'org_manager' | 'org_viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, any>;
  is_active: boolean;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  invited_by: string | null;
  joined_at: string;
  is_active: boolean;
}

export interface CreateOrganizationData {
  name: string;
  slug?: string;
}

export interface InviteMemberData {
  email: string;
  role: OrgRole;
  organization_id: string;
}
