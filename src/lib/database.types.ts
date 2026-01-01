export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          current_streak: number
          longest_streak: number
          last_activity_date: string | null
          total_learning_minutes: number
          streak_protection_used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          total_learning_minutes?: number
          streak_protection_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          total_learning_minutes?: number
          streak_protection_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      learning_paths: {
        Row: {
          id: string
          title: string
          description: string | null
          icon: string | null
          estimated_hours: number
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          icon?: string | null
          estimated_hours?: number
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          icon?: string | null
          estimated_hours?: number
          display_order?: number
          created_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          learning_path_id: string
          title: string
          description: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          learning_path_id: string
          title: string
          description?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          learning_path_id?: string
          title?: string
          description?: string | null
          display_order?: number
          created_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          module_id: string
          title: string
          concept: string | null
          thought_process: string | null
          common_mistakes: string | null
          estimated_minutes: number
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          concept?: string | null
          thought_process?: string | null
          common_mistakes?: string | null
          estimated_minutes?: number
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          concept?: string | null
          thought_process?: string | null
          common_mistakes?: string | null
          estimated_minutes?: number
          display_order?: number
          created_at?: string
        }
      }
      practice_problems: {
        Row: {
          id: string
          topic_id: string
          title: string
          description: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          pattern_tags: string[]
          hints: string[]
          optimal_solution: string | null
          created_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          title: string
          description?: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          pattern_tags?: string[]
          hints?: string[]
          optimal_solution?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          title?: string
          description?: string | null
          difficulty?: 'easy' | 'medium' | 'hard'
          pattern_tags?: string[]
          hints?: string[]
          optimal_solution?: string | null
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          status: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          mastery_score: number
          time_spent_minutes: number
          completed_at: string | null
          last_reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          mastery_score?: number
          time_spent_minutes?: number
          completed_at?: string | null
          last_reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          mastery_score?: number
          time_spent_minutes?: number
          completed_at?: string | null
          last_reviewed_at?: string | null
          created_at?: string
        }
      }
      user_problem_attempts: {
        Row: {
          id: string
          user_id: string
          problem_id: string
          solution_text: string | null
          is_correct: boolean
          time_taken_minutes: number
          attempted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          problem_id: string
          solution_text?: string | null
          is_correct?: boolean
          time_taken_minutes?: number
          attempted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          problem_id?: string
          solution_text?: string | null
          is_correct?: boolean
          time_taken_minutes?: number
          attempted_at?: string
        }
      }
      weak_areas: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          weakness_score: number
          identified_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          weakness_score?: number
          identified_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          weakness_score?: number
          identified_at?: string
          resolved_at?: string | null
        }
      }
      revision_schedule: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          next_review_date: string
          review_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          next_review_date: string
          review_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          next_review_date?: string
          review_count?: number
          created_at?: string
        }
      }
      discussion_threads: {
        Row: {
          id: string
          topic_id: string
          user_id: string
          title: string
          content: string
          is_anonymous: boolean
          upvotes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          user_id: string
          title: string
          content: string
          is_anonymous?: boolean
          upvotes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          user_id?: string
          title?: string
          content?: string
          is_anonymous?: boolean
          upvotes?: number
          created_at?: string
          updated_at?: string
        }
      }
      discussion_replies: {
        Row: {
          id: string
          thread_id: string
          user_id: string
          content: string
          is_anonymous: boolean
          upvotes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          user_id: string
          content: string
          is_anonymous?: boolean
          upvotes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          user_id?: string
          content?: string
          is_anonymous?: boolean
          upvotes?: number
          created_at?: string
          updated_at?: string
        }
      }
      mentor_profiles: {
        Row: {
          id: string
          user_id: string
          expertise_areas: string[]
          hourly_rate: number
          bio: string | null
          availability: string | null
          accepts_quick_sessions: boolean
          quick_session_availability: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          expertise_areas?: string[]
          hourly_rate?: number
          bio?: string | null
          availability?: string | null
          accepts_quick_sessions?: boolean
          quick_session_availability?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          expertise_areas?: string[]
          hourly_rate?: number
          bio?: string | null
          availability?: string | null
          accepts_quick_sessions?: boolean
          quick_session_availability?: Json
          created_at?: string
        }
      }
      mentor_bookings: {
        Row: {
          id: string
          mentor_id: string
          student_id: string
          session_type: 'one_on_one' | 'group_doubt' | 'resume_review' | 'mock_interview'
          scheduled_at: string
          duration_minutes: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          student_id: string
          session_type: 'one_on_one' | 'group_doubt' | 'resume_review' | 'mock_interview'
          scheduled_at: string
          duration_minutes?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          student_id?: string
          session_type?: 'one_on_one' | 'group_doubt' | 'resume_review' | 'mock_interview'
          scheduled_at?: string
          duration_minutes?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at?: string
        }
      }
      subscription_tiers: {
        Row: {
          id: string
          name: string
          price_inr: number
          billing_period: 'monthly' | 'yearly'
          description: string | null
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price_inr: number
          billing_period?: 'monthly' | 'yearly'
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price_inr?: number
          billing_period?: 'monthly' | 'yearly'
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      subscription_features: {
        Row: {
          id: string
          tier_id: string
          feature_key: string
          feature_name: string
          feature_description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tier_id: string
          feature_key: string
          feature_name: string
          feature_description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tier_id?: string
          feature_key?: string
          feature_name?: string
          feature_description?: string | null
          created_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          tier_id: string
          status: 'active' | 'cancelled' | 'expired' | 'paused'
          started_at: string
          expires_at: string
          cancelled_at: string | null
          auto_renew: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier_id: string
          status?: 'active' | 'cancelled' | 'expired' | 'paused'
          started_at?: string
          expires_at: string
          cancelled_at?: string | null
          auto_renew?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier_id?: string
          status?: 'active' | 'cancelled' | 'expired' | 'paused'
          started_at?: string
          expires_at?: string
          cancelled_at?: string | null
          auto_renew?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payment_transactions: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          amount_inr: number
          payment_gateway: string
          gateway_transaction_id: string | null
          gateway_order_id: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          payment_type: 'subscription' | 'donation' | 'mentor_session' | 'quick_session'
          failure_reason: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          amount_inr: number
          payment_gateway?: string
          gateway_transaction_id?: string | null
          gateway_order_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          payment_type: 'subscription' | 'donation' | 'mentor_session' | 'quick_session'
          failure_reason?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          amount_inr?: number
          payment_gateway?: string
          gateway_transaction_id?: string | null
          gateway_order_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          payment_type?: 'subscription' | 'donation' | 'mentor_session' | 'quick_session'
          failure_reason?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      cohorts: {
        Row: {
          id: string
          batch_number: number
          name: string
          description: string | null
          start_date: string
          end_date: string
          max_members: number
          current_members: number
          subscription_tier_required: string | null
          status: 'upcoming' | 'active' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          batch_number: number
          name: string
          description?: string | null
          start_date: string
          end_date: string
          max_members?: number
          current_members?: number
          subscription_tier_required?: string | null
          status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          batch_number?: number
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          max_members?: number
          current_members?: number
          subscription_tier_required?: string | null
          status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
          created_at?: string
        }
      }
      cohort_members: {
        Row: {
          id: string
          cohort_id: string
          user_id: string
          role: 'member' | 'mentor' | 'admin'
          joined_at: string
          left_at: string | null
          completion_status: 'active' | 'completed' | 'dropped'
        }
        Insert: {
          id?: string
          cohort_id: string
          user_id: string
          role?: 'member' | 'mentor' | 'admin'
          joined_at?: string
          left_at?: string | null
          completion_status?: 'active' | 'completed' | 'dropped'
        }
        Update: {
          id?: string
          cohort_id?: string
          user_id?: string
          role?: 'member' | 'mentor' | 'admin'
          joined_at?: string
          left_at?: string | null
          completion_status?: 'active' | 'completed' | 'dropped'
        }
      }
      cohort_activities: {
        Row: {
          id: string
          cohort_id: string
          title: string
          description: string | null
          activity_type: 'challenge' | 'milestone' | 'weekly_goal' | 'group_task'
          target_value: number
          points_reward: number
          start_date: string | null
          end_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cohort_id: string
          title: string
          description?: string | null
          activity_type: 'challenge' | 'milestone' | 'weekly_goal' | 'group_task'
          target_value?: number
          points_reward?: number
          start_date?: string | null
          end_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cohort_id?: string
          title?: string
          description?: string | null
          activity_type?: 'challenge' | 'milestone' | 'weekly_goal' | 'group_task'
          target_value?: number
          points_reward?: number
          start_date?: string | null
          end_date?: string | null
          created_at?: string
        }
      }
      cohort_member_progress: {
        Row: {
          id: string
          activity_id: string
          user_id: string
          current_value: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          user_id: string
          current_value?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          user_id?: string
          current_value?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cohort_leaderboard: {
        Row: {
          id: string
          cohort_id: string
          user_id: string
          week_start: string
          points: number
          topics_completed: number
          problems_solved: number
          rank: number | null
          created_at: string
        }
        Insert: {
          id?: string
          cohort_id: string
          user_id: string
          week_start: string
          points?: number
          topics_completed?: number
          problems_solved?: number
          rank?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          cohort_id?: string
          user_id?: string
          week_start?: string
          points?: number
          topics_completed?: number
          problems_solved?: number
          rank?: number | null
          created_at?: string
        }
      }
      cohort_discussion_threads: {
        Row: {
          id: string
          cohort_id: string
          user_id: string
          title: string
          content: string
          is_pinned: boolean
          reply_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cohort_id: string
          user_id: string
          title: string
          content: string
          is_pinned?: boolean
          reply_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cohort_id?: string
          user_id?: string
          title?: string
          content?: string
          is_pinned?: boolean
          reply_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      cohort_discussion_replies: {
        Row: {
          id: string
          thread_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      mentor_session_types: {
        Row: {
          id: string
          name: string
          description: string | null
          duration_minutes: number
          price_inr: number
          is_active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration_minutes: number
          price_inr: number
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration_minutes?: number
          price_inr?: number
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
      }
      quick_mentor_bookings: {
        Row: {
          id: string
          mentor_id: string
          student_id: string
          session_type_id: string
          scheduled_at: string
          duration_minutes: number
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          prep_notes: string | null
          meeting_link: string | null
          rating: number | null
          feedback: string | null
          payment_transaction_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          student_id: string
          session_type_id: string
          scheduled_at: string
          duration_minutes: number
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          prep_notes?: string | null
          meeting_link?: string | null
          rating?: number | null
          feedback?: string | null
          payment_transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          student_id?: string
          session_type_id?: string
          scheduled_at?: string
          duration_minutes?: number
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          prep_notes?: string | null
          meeting_link?: string | null
          rating?: number | null
          feedback?: string | null
          payment_transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      donation_tiers: {
        Row: {
          id: string
          name: string
          amount_inr: number
          description: string | null
          benefits: string[]
          badge_icon: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          amount_inr: number
          description?: string | null
          benefits?: string[]
          badge_icon?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          amount_inr?: number
          description?: string | null
          benefits?: string[]
          badge_icon?: string | null
          display_order?: number
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          user_id: string
          tier_id: string | null
          amount_inr: number
          is_recurring: boolean
          recurring_frequency: 'monthly' | 'yearly' | null
          message: string | null
          is_anonymous: boolean
          payment_transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier_id?: string | null
          amount_inr: number
          is_recurring?: boolean
          recurring_frequency?: 'monthly' | 'yearly' | null
          message?: string | null
          is_anonymous?: boolean
          payment_transaction_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier_id?: string | null
          amount_inr?: number
          is_recurring?: boolean
          recurring_frequency?: 'monthly' | 'yearly' | null
          message?: string | null
          is_anonymous?: boolean
          payment_transaction_id?: string | null
          created_at?: string
        }
      }
      supporter_badges: {
        Row: {
          id: string
          user_id: string
          badge_type: 'supporter' | 'champion' | 'hero' | 'founding_member' | 'top_donor'
          earned_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          badge_type: 'supporter' | 'champion' | 'hero' | 'founding_member' | 'top_donor'
          earned_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          badge_type?: 'supporter' | 'champion' | 'hero' | 'founding_member' | 'top_donor'
          earned_at?: string
          expires_at?: string | null
        }
      }
      daily_goals: {
        Row: {
          id: string
          user_id: string
          goal_date: string
          goal_type: 'complete_topic' | 'solve_problems' | 'review_topic' | 'learning_minutes' | 'practice_weak_area'
          target_id: string | null
          target_value: number
          current_value: number
          is_completed: boolean
          completed_at: string | null
          points_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_date: string
          goal_type: 'complete_topic' | 'solve_problems' | 'review_topic' | 'learning_minutes' | 'practice_weak_area'
          target_id?: string | null
          target_value?: number
          current_value?: number
          is_completed?: boolean
          completed_at?: string | null
          points_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_date?: string
          goal_type?: 'complete_topic' | 'solve_problems' | 'review_topic' | 'learning_minutes' | 'practice_weak_area'
          target_id?: string | null
          target_value?: number
          current_value?: number
          is_completed?: boolean
          completed_at?: string | null
          points_earned?: number
          created_at?: string
        }
      }
      streak_protection_log: {
        Row: {
          id: string
          user_id: string
          protected_date: string
          subscription_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          protected_date: string
          subscription_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          protected_date?: string
          subscription_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
