export type SequenceStatus = 'locked' | 'unlocked' | 'completed' | 'awaiting_response';
export type UserRole = 'student' | 'instructor' | 'admin';
export type ModuleStatus = 'draft' | 'published' | 'archived';

export interface Database {
  public: {
    Tables: {
      yoi_users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          bio?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          bio?: string | null;
        };
      };
      yoi_modules: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          cover_image_url: string | null;
          intro_video_url: string | null;
          module_order: number;
          status: ModuleStatus;
          total_sequences: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          subtitle?: string | null;
          description?: string | null;
          cover_image_url?: string | null;
          intro_video_url?: string | null;
          module_order: number;
          status?: ModuleStatus;
          total_sequences?: number;
        };
        Update: {
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          cover_image_url?: string | null;
          intro_video_url?: string | null;
          module_order?: number;
          status?: ModuleStatus;
          total_sequences?: number;
        };
      };
      yoi_module_sequences: {
        Row: {
          id: string;
          module_id: string;
          sequence_number: number;
          title: string;
          description: string | null;
          sequence_type: string;
          content_url: string | null;
          content_text: string | null;
          content_image_url: string | null;
          instructions: string | null;
          requires_upload: boolean;
          requires_instructor_response: boolean;
          min_video_seconds: number | null;
          max_video_seconds: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          module_id: string;
          sequence_number: number;
          title: string;
          description?: string | null;
          sequence_type: string;
          content_url?: string | null;
          content_text?: string | null;
          content_image_url?: string | null;
          instructions?: string | null;
          requires_upload?: boolean;
          requires_instructor_response?: boolean;
          min_video_seconds?: number | null;
          max_video_seconds?: number | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          sequence_type?: string;
          content_url?: string | null;
          content_text?: string | null;
          content_image_url?: string | null;
          instructions?: string | null;
          requires_upload?: boolean;
          requires_instructor_response?: boolean;
        };
      };
      yoi_user_progress: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          sequence_id: string;
          status: SequenceStatus;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          module_id: string;
          sequence_id: string;
          status?: SequenceStatus;
        };
        Update: {
          status?: SequenceStatus;
          completed_at?: string | null;
        };
      };
      yoi_video_submissions: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          sequence_id: string;
          video_url: string;
          duration_seconds: number | null;
          thumbnail_url: string | null;
          status: 'pending' | 'reviewed' | 'rejected';
          submitted_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          user_id: string;
          module_id: string;
          sequence_id: string;
          video_url: string;
          duration_seconds?: number | null;
          thumbnail_url?: string | null;
          status?: 'pending' | 'reviewed' | 'rejected';
        };
        Update: {
          status?: 'pending' | 'reviewed' | 'rejected';
          reviewed_at?: string | null;
        };
      };
      yoi_instructor_responses: {
        Row: {
          id: string;
          submission_id: string;
          instructor_id: string;
          user_id: string;
          module_id: string;
          sequence_id: string;
          response_video_url: string | null;
          response_audio_url: string | null;
          message: string | null;
          next_meditation_url: string | null;
          created_at: string;
        };
        Insert: {
          submission_id: string;
          instructor_id: string;
          user_id: string;
          module_id: string;
          sequence_id: string;
          response_video_url?: string | null;
          response_audio_url?: string | null;
          message?: string | null;
          next_meditation_url?: string | null;
        };
        Update: {
          response_video_url?: string | null;
          response_audio_url?: string | null;
          message?: string | null;
          next_meditation_url?: string | null;
        };
      };
      yoi_voice_reflections: {
        Row: {
          id: string;
          user_id: string;
          module_id: string | null;
          sequence_id: string | null;
          audio_url: string;
          transcript: string | null;
          duration_seconds: number;
          tags: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          module_id?: string | null;
          sequence_id?: string | null;
          audio_url: string;
          transcript?: string | null;
          duration_seconds: number;
          tags?: Record<string, unknown> | null;
        };
        Update: {
          transcript?: string | null;
          tags?: Record<string, unknown> | null;
        };
      };
      yoi_user_goals: {
        Row: {
          id: string;
          user_id: string;
          goal_text: string;
          small_action: string | null;
          target_date: string;
          status: 'active' | 'completed' | 'abandoned';
          progress_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          goal_text: string;
          small_action?: string | null;
          target_date: string;
          status?: 'active' | 'completed' | 'abandoned';
          progress_notes?: string | null;
        };
        Update: {
          goal_text?: string;
          small_action?: string | null;
          target_date?: string;
          status?: 'active' | 'completed' | 'abandoned';
          progress_notes?: string | null;
        };
      };
      shabda_articles: {
        Row: {
          id: string;
          title: string;
          author: string | null;
          source: string | null;
          source_url: string | null;
          category: string | null;
          tags: string[] | null;
          themes: string[] | null;
          content: string;
          word_count: number | null;
          char_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
      };
      shabda_article_chunks: {
        Row: {
          id: string;
          article_id: string;
          chunk_index: number;
          section_heading: string | null;
          chunk_text: string;
          token_count: number | null;
          char_count: number | null;
          embedding_model: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
      objectivist_articles: {
        Row: {
          id: string;
          title: string;
          author: string | null;
          source: string | null;
          source_url: string | null;
          category: string | null;
          tags: string[] | null;
          themes: string[] | null;
          content: string;
          word_count: number | null;
          char_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
      };
      objectivist_article_chunks: {
        Row: {
          id: string;
          article_id: string;
          chunk_index: number;
          section_heading: string | null;
          chunk_text: string;
          token_count: number | null;
          char_count: number | null;
          embedding_model: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_shabda_chunks: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: string;
          article_id: string;
          chunk_text: string;
          section_heading: string | null;
          similarity: number;
        }[];
      };
      match_objectivist_chunks: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: string;
          article_id: string;
          chunk_text: string;
          section_heading: string | null;
          similarity: number;
        }[];
      };
      yoi_admin_unlock_sequence: {
        Args: {
          p_user_id: string;
          p_module_id: string;
          p_sequence_id: string;
          p_submission_id: string;
          p_response_video_url: string;
          p_message?: string | null;
          p_next_meditation_url?: string | null;
        };
        Returns: {
          success: boolean;
          next_sequence_id: string | null;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
