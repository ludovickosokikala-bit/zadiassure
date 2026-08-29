export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_user_connections: {
        Row: {
          account_email: string
          connection_key_ciphertext: string
          connector_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_email?: string
          connection_key_ciphertext: string
          connector_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_email?: string
          connection_key_ciphertext?: string
          connector_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          all_day: boolean
          assigned_to: string | null
          attendee_emails: string[]
          case_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string
          ends_at: string
          external_event_id: string | null
          id: string
          location: string
          meeting_kind: string
          organization_id: string
          starts_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          assigned_to?: string | null
          attendee_emails?: string[]
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          ends_at: string
          external_event_id?: string | null
          id?: string
          location?: string
          meeting_kind?: string
          organization_id: string
          starts_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          assigned_to?: string | null
          attendee_emails?: string[]
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          ends_at?: string
          external_event_id?: string | null
          id?: string
          location?: string
          meeting_kind?: string
          organization_id?: string
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string
          city: string
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          address?: string
          city?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_feeds: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_feeds_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_activities: {
        Row: {
          actor_id: string | null
          actor_label: string
          case_id: string | null
          client_id: string | null
          created_at: string
          detail: Json
          id: string
          is_internal: boolean
          kind: string
          organization_id: string
          summary: string
        }
        Insert: {
          actor_id?: string | null
          actor_label?: string
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          is_internal?: boolean
          kind: string
          organization_id: string
          summary: string
        }
        Update: {
          actor_id?: string | null
          actor_label?: string
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          is_internal?: boolean
          kind?: string
          organization_id?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_activities_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_documents: {
        Row: {
          case_id: string | null
          client_id: string
          created_at: string
          deleted_at: string | null
          document_type: string
          expires_on: string | null
          id: string
          mime_type: string
          name: string
          notes: string
          organization_id: string
          requested_from_client: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          size_bytes: number | null
          status: Database["public"]["Enums"]["crm_document_status"]
          storage_path: string | null
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          case_id?: string | null
          client_id: string
          created_at?: string
          deleted_at?: string | null
          document_type?: string
          expires_on?: string | null
          id?: string
          mime_type?: string
          name: string
          notes?: string
          organization_id: string
          requested_from_client?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["crm_document_status"]
          storage_path?: string | null
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string | null
          client_id?: string
          created_at?: string
          deleted_at?: string | null
          document_type?: string
          expires_on?: string | null
          id?: string
          mime_type?: string
          name?: string
          notes?: string
          organization_id?: string
          requested_from_client?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["crm_document_status"]
          storage_path?: string | null
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_notes: {
        Row: {
          author_id: string | null
          body: string
          case_id: string | null
          client_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_internal: boolean
          organization_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean
          organization_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_statuses: {
        Row: {
          created_at: string
          id: string
          is_open: boolean
          key: string
          label_en: string
          label_fr: string
          label_nl: string
          organization_id: string
          sort_order: number
          tone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_open?: boolean
          key: string
          label_en: string
          label_fr: string
          label_nl: string
          organization_id: string
          sort_order?: number
          tone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_open?: boolean
          key?: string
          label_en?: string
          label_fr?: string
          label_nl?: string
          organization_id?: string
          sort_order?: number
          tone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_statuses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_types: {
        Row: {
          active: boolean
          created_at: string
          default_duration_days: number | null
          default_tasks: Json
          description: string
          id: string
          key: string
          name_en: string
          name_fr: string
          name_nl: string
          organization_id: string
          required_documents: Json
          sort_order: number
          updated_at: string
          workflow_stages: Json
        }
        Insert: {
          active?: boolean
          created_at?: string
          default_duration_days?: number | null
          default_tasks?: Json
          description?: string
          id?: string
          key: string
          name_en: string
          name_fr: string
          name_nl: string
          organization_id: string
          required_documents?: Json
          sort_order?: number
          updated_at?: string
          workflow_stages?: Json
        }
        Update: {
          active?: boolean
          created_at?: string
          default_duration_days?: number | null
          default_tasks?: Json
          description?: string
          id?: string
          key?: string
          name_en?: string
          name_fr?: string
          name_nl?: string
          organization_id?: string
          required_documents?: Json
          sort_order?: number
          updated_at?: string
          workflow_stages?: Json
        }
        Relationships: [
          {
            foreignKeyName: "case_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_to: string | null
          branch_id: string | null
          case_number: number | null
          case_type_id: string | null
          client_id: string
          closed_at: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          deleted_at: string | null
          description: string
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["crm_priority"]
          progress: number
          stage: string
          start_date: string | null
          status_key: string
          tags: string[]
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          branch_id?: string | null
          case_number?: number | null
          case_type_id?: string | null
          client_id: string
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          deleted_at?: string | null
          description?: string
          id?: string
          organization_id: string
          priority?: Database["public"]["Enums"]["crm_priority"]
          progress?: number
          stage?: string
          start_date?: string | null
          status_key?: string
          tags?: string[]
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          branch_id?: string | null
          case_number?: number | null
          case_type_id?: string | null
          client_id?: string
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          deleted_at?: string | null
          description?: string
          id?: string
          organization_id?: string
          priority?: Database["public"]["Enums"]["crm_priority"]
          progress?: number
          stage?: string
          start_date?: string | null
          status_key?: string
          tags?: string[]
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_case_type_id_fkey"
            columns: ["case_type_id"]
            isOneToOne: false
            referencedRelation: "case_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string
          assigned_to: string | null
          branch_id: string | null
          city: string
          client_type: Database["public"]["Enums"]["crm_client_type"]
          company_name: string
          contact_preference: Database["public"]["Enums"]["crm_contact_pref"]
          country: string
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          notes: string
          organization_id: string
          phone: string
          portal_user_id: string | null
          postal_code: string
          preferred_language: Database["public"]["Enums"]["crm_lang"]
          status: string
          updated_at: string
        }
        Insert: {
          address?: string
          assigned_to?: string | null
          branch_id?: string | null
          city?: string
          client_type?: Database["public"]["Enums"]["crm_client_type"]
          company_name?: string
          contact_preference?: Database["public"]["Enums"]["crm_contact_pref"]
          country?: string
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notes?: string
          organization_id: string
          phone?: string
          portal_user_id?: string | null
          postal_code?: string
          preferred_language?: Database["public"]["Enums"]["crm_lang"]
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string
          assigned_to?: string | null
          branch_id?: string | null
          city?: string
          client_type?: Database["public"]["Enums"]["crm_client_type"]
          company_name?: string
          contact_preference?: Database["public"]["Enums"]["crm_contact_pref"]
          country?: string
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notes?: string
          organization_id?: string
          phone?: string
          portal_user_id?: string | null
          postal_code?: string
          preferred_language?: Database["public"]["Enums"]["crm_lang"]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          answers: Json
          attachments: Json
          audience: string
          created_at: string
          email: string
          full_name: string
          id: string
          language: string
          message: string
          phone: string
          status: string
          template_id: string | null
          template_slug: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          attachments?: Json
          audience?: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          language?: string
          message?: string
          phone?: string
          status?: string
          template_id?: string | null
          template_slug?: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          attachments?: Json
          audience?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          language?: string
          message?: string
          phone?: string
          status?: string
          template_id?: string | null
          template_slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          audiences: string[]
          authority: string
          checklist: Json
          created_at: string
          description_en: string
          description_fr: string
          description_nl: string
          id: string
          official_label: string | null
          official_url: string | null
          published: boolean
          slug: string
          sort_order: number
          theme: Database["public"]["Enums"]["content_theme"]
          title_en: string
          title_fr: string
          title_nl: string
          updated_at: string
          who_en: string
          who_fr: string
          who_nl: string
        }
        Insert: {
          audiences?: string[]
          authority?: string
          checklist?: Json
          created_at?: string
          description_en: string
          description_fr: string
          description_nl: string
          id?: string
          official_label?: string | null
          official_url?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          theme: Database["public"]["Enums"]["content_theme"]
          title_en: string
          title_fr: string
          title_nl: string
          updated_at?: string
          who_en?: string
          who_fr?: string
          who_nl?: string
        }
        Update: {
          audiences?: string[]
          authority?: string
          checklist?: Json
          created_at?: string
          description_en?: string
          description_fr?: string
          description_nl?: string
          id?: string
          official_label?: string | null
          official_url?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          theme?: Database["public"]["Enums"]["content_theme"]
          title_en?: string
          title_fr?: string
          title_nl?: string
          updated_at?: string
          who_en?: string
          who_fr?: string
          who_nl?: string
        }
        Relationships: []
      }
      legislation_updates: {
        Row: {
          action_en: string
          action_fr: string
          action_nl: string
          audiences: string[]
          changes_en: string
          changes_fr: string
          changes_nl: string
          created_at: string
          effective_date: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          source_label: string | null
          source_url: string | null
          summary_en: string
          summary_fr: string
          summary_nl: string
          theme: Database["public"]["Enums"]["content_theme"]
          title_en: string
          title_fr: string
          title_nl: string
          updated_at: string
        }
        Insert: {
          action_en?: string
          action_fr?: string
          action_nl?: string
          audiences?: string[]
          changes_en?: string
          changes_fr?: string
          changes_nl?: string
          created_at?: string
          effective_date?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          source_label?: string | null
          source_url?: string | null
          summary_en: string
          summary_fr: string
          summary_nl: string
          theme: Database["public"]["Enums"]["content_theme"]
          title_en: string
          title_fr: string
          title_nl: string
          updated_at?: string
        }
        Update: {
          action_en?: string
          action_fr?: string
          action_nl?: string
          audiences?: string[]
          changes_en?: string
          changes_fr?: string
          changes_nl?: string
          created_at?: string
          effective_date?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          source_label?: string | null
          source_url?: string | null
          summary_en?: string
          summary_fr?: string
          summary_nl?: string
          theme?: Database["public"]["Enums"]["content_theme"]
          title_en?: string
          title_fr?: string
          title_nl?: string
          updated_at?: string
        }
        Relationships: []
      }
      mandates: {
        Row: {
          applicant_address: string
          applicant_birth_date: string | null
          applicant_email: string
          applicant_name: string
          applicant_phone: string
          case_id: string | null
          client_id: string | null
          consent: boolean
          created_at: string
          created_by: string | null
          deleted_at: string | null
          document_id: string | null
          ends_on: string | null
          holder_name: string
          holder_user_id: string | null
          id: string
          language: Database["public"]["Enums"]["crm_lang"]
          notes: string
          organization_id: string
          purpose: string
          scope: string[]
          signature_image: string | null
          signed_at: string | null
          signed_full_name: string
          source: string
          starts_on: string | null
          status: Database["public"]["Enums"]["crm_mandate_status"]
          updated_at: string
        }
        Insert: {
          applicant_address?: string
          applicant_birth_date?: string | null
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string
          case_id?: string | null
          client_id?: string | null
          consent?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_id?: string | null
          ends_on?: string | null
          holder_name?: string
          holder_user_id?: string | null
          id?: string
          language?: Database["public"]["Enums"]["crm_lang"]
          notes?: string
          organization_id: string
          purpose?: string
          scope?: string[]
          signature_image?: string | null
          signed_at?: string | null
          signed_full_name?: string
          source?: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["crm_mandate_status"]
          updated_at?: string
        }
        Update: {
          applicant_address?: string
          applicant_birth_date?: string | null
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string
          case_id?: string | null
          client_id?: string | null
          consent?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_id?: string | null
          ends_on?: string | null
          holder_name?: string
          holder_user_id?: string | null
          id?: string
          language?: Database["public"]["Enums"]["crm_lang"]
          notes?: string
          organization_id?: string
          purpose?: string
          scope?: string[]
          signature_image?: string | null
          signed_at?: string | null
          signed_full_name?: string
          source?: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["crm_mandate_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mandates_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandates_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "case_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_invites: {
        Row: {
          accepted_at: string | null
          branch_id: string | null
          created_at: string
          email: string
          expires_at: string
          full_name: string
          id: string
          invited_by: string | null
          organization_id: string
          role: Database["public"]["Enums"]["crm_role"]
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          branch_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          full_name?: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["crm_role"]
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          branch_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          full_name?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["crm_role"]
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_invites_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          active: boolean
          branch_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["crm_role"]
          ui_language: Database["public"]["Enums"]["crm_lang"]
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          branch_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["crm_role"]
          ui_language?: Database["public"]["Enums"]["crm_lang"]
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          branch_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["crm_role"]
          ui_language?: Database["public"]["Enums"]["crm_lang"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string
          case_number_prefix: string
          case_number_seq: number
          created_at: string
          default_language: Database["public"]["Enums"]["crm_lang"]
          deleted_at: string | null
          email: string
          id: string
          name: string
          phone: string
          slug: string
          updated_at: string
        }
        Insert: {
          address?: string
          case_number_prefix?: string
          case_number_seq?: number
          created_at?: string
          default_language?: Database["public"]["Enums"]["crm_lang"]
          deleted_at?: string | null
          email?: string
          id?: string
          name: string
          phone?: string
          slug: string
          updated_at?: string
        }
        Update: {
          address?: string
          case_number_prefix?: string
          case_number_seq?: number
          created_at?: string
          default_language?: Database["public"]["Enums"]["crm_lang"]
          deleted_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          case_id: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string
          due_date: string | null
          due_time: string | null
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["crm_priority"]
          status: Database["public"]["Enums"]["crm_task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          due_date?: string | null
          due_time?: string | null
          id?: string
          organization_id: string
          priority?: Database["public"]["Enums"]["crm_priority"]
          status?: Database["public"]["Enums"]["crm_task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          due_date?: string | null
          due_time?: string | null
          id?: string
          organization_id?: string
          priority?: Database["public"]["Enums"]["crm_priority"]
          status?: Database["public"]["Enums"]["crm_task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      content_theme: "immigration" | "budget" | "business" | "social"
      crm_client_type:
        | "individual"
        | "family"
        | "self_employed"
        | "organization"
        | "other"
      crm_contact_pref: "email" | "phone" | "whatsapp" | "post" | "portal"
      crm_document_status:
        | "requested"
        | "received"
        | "under_review"
        | "approved"
        | "rejected"
        | "expired"
      crm_lang: "nl" | "fr" | "en"
      crm_mandate_status:
        | "pending_signature"
        | "signed"
        | "active"
        | "revoked"
        | "expired"
      crm_priority: "low" | "normal" | "high" | "urgent"
      crm_role:
        | "super_admin"
        | "owner"
        | "admin"
        | "manager"
        | "case_manager"
        | "employee"
        | "partner"
        | "client"
      crm_task_status:
        | "todo"
        | "in_progress"
        | "waiting"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
      content_theme: ["immigration", "budget", "business", "social"],
      crm_client_type: [
        "individual",
        "family",
        "self_employed",
        "organization",
        "other",
      ],
      crm_contact_pref: ["email", "phone", "whatsapp", "post", "portal"],
      crm_document_status: [
        "requested",
        "received",
        "under_review",
        "approved",
        "rejected",
        "expired",
      ],
      crm_lang: ["nl", "fr", "en"],
      crm_mandate_status: [
        "pending_signature",
        "signed",
        "active",
        "revoked",
        "expired",
      ],
      crm_priority: ["low", "normal", "high", "urgent"],
      crm_role: [
        "super_admin",
        "owner",
        "admin",
        "manager",
        "case_manager",
        "employee",
        "partner",
        "client",
      ],
      crm_task_status: [
        "todo",
        "in_progress",
        "waiting",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
