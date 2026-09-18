import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAuditEvent } from "./audit-data";

export type YouTubeChannelRow = {
  id: string;
  user_id: string;
  key: "movie" | "finance" | "documentary" | "books";
  name: string;
  emoji: string;
  subscribers: number;
  views_count: number;
  monthly_revenue: number;
  target_revenue: number;
  monetized: boolean;
};

export type YouTubeVideoRow = {
  id: string;
  user_id: string;
  channel_key: string;
  title: string;
  title_variations?: string | null;
  stage: "Ideas" | "Research" | "Script" | "Production" | "Editing" | "Thumbnail" | "Scheduled" | "Published";
  topic: string | null;
  concept_hook?: string | null;
  audience_intent?: string | null;
  target_length?: string | null;
  inspiration_links?: string | null;
  sponsorship_cta?: string | null;

  // Research & Scripting
  script_content: string | null;
  financial_claims: string | null;
  shot_list?: string | null;
  script_status?: string | null;
  script_done?: boolean;

  // Production & Recording
  vo_done?: boolean;
  aroll_done?: boolean;
  broll_done?: boolean;
  audio_done?: boolean;

  // Editing & Post
  rough_cut_done?: boolean;
  fine_cut_done?: boolean;
  sound_done?: boolean;
  graphics_done?: boolean;
  color_done?: boolean;
  editing_done?: boolean;

  // Packaging & SEO
  thumbnail_url: string | null;
  thumbnail_ab_notes?: string | null;
  seo_description?: string | null;
  tags_hashtags?: string | null;
  cards_done?: boolean;
  subtitles_done?: boolean;
  thumbnail_done?: boolean;

  // Distribution
  monetization_check_done?: boolean;
  preview_done?: boolean;
  scheduled_date: string | null;
  community_post_draft?: string | null;
  shortform_repurpose_plan?: string | null;

  // Post-Publication Metrics
  views: number;
  impressions?: number;
  ctr: number;
  avd_seconds?: number;
  retention_30s?: number;
  watch_time_hours?: number;
  revenue: number;
  rpm: number;
  cpm?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  subs_gained?: number;
  traffic_source?: string | null;

  doc_day1_done: boolean;
  doc_day2_done: boolean;
  created_at: string;
};

export type BookRow = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  reading_progress: number;
  summary_notes: string | null;
  key_takeaways: string | null;
  rating: number;
  created_at: string;
};

const DEFAULT_CHANNELS: Omit<YouTubeChannelRow, "id" | "user_id">[] = [
  { key: "movie", name: "Movie Review", emoji: "🎬", subscribers: 0, views_count: 0, monthly_revenue: 0, target_revenue: 2000, monetized: false },
  { key: "finance", name: "Finance Channel", emoji: "💰", subscribers: 0, views_count: 0, monthly_revenue: 0, target_revenue: 3000, monetized: false },
  { key: "documentary", name: "Documentary", emoji: "🎥", subscribers: 0, views_count: 0, monthly_revenue: 0, target_revenue: 3500, monetized: false },
  { key: "books", name: "Book Review", emoji: "📚", subscribers: 0, views_count: 0, monthly_revenue: 0, target_revenue: 1500, monetized: false },
];

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export function useYouTubeChannels() {
  return useQuery({
    queryKey: ["youtube_channels"],
    queryFn: async (): Promise<YouTubeChannelRow[]> => {
      const { data: existing, error } = await (supabase.from as any)("youtube_channels").select("*");
      if (error) throw error;
      if (existing && existing.length > 0) return existing as YouTubeChannelRow[];

      // Seed default channels if empty
      const userId = await requireUserId();
      const seedRows = DEFAULT_CHANNELS.map((ch) => ({ ...ch, user_id: userId }));
      const { data: inserted, error: insertErr } = await (supabase.from as any)("youtube_channels")
        .insert(seedRows)
        .select("*");
      if (insertErr) {
        console.warn("Could not insert channel seed:", insertErr);
        return DEFAULT_CHANNELS.map((ch, idx) => ({ ...ch, id: `seed-${idx}`, user_id: userId })) as YouTubeChannelRow[];
      }
      return (inserted ?? []) as YouTubeChannelRow[];
    },
  });
}

export function useYouTubeVideos(channelKey?: string) {
  return useQuery({
    queryKey: ["youtube_videos", channelKey || "all"],
    queryFn: async (): Promise<YouTubeVideoRow[]> => {
      let query = (supabase.from as any)("youtube_videos").select("*").order("created_at", { ascending: false });
      if (channelKey) query = query.eq("channel_key", channelKey);
      const { data, error } = await query;
      if (error) {
        console.warn("Error loading videos:", error);
        return [];
      }
      return (data ?? []) as YouTubeVideoRow[];
    },
  });
}

export function useCreateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { channel_key: string; title: string; stage?: string; topic?: string }) => {
      const userId = await requireUserId();
      const payload: any = {
        user_id: userId,
        channel_key: input.channel_key,
        title: input.title,
        stage: input.stage || "Ideas",
      };
      if (input.topic) payload.topic = input.topic;

      const { data, error } = await (supabase.from as any)("youtube_videos")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;

      logAuditEvent({
        entity_type: "video",
        action: "CREATE",
        title: `Video Project: ${input.title}`,
        details: `Channel: ${input.channel_key.toUpperCase()}, Stage: ${payload.stage}`,
      });

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["youtube_videos"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useUpdateChannelMetrics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      subscribers?: number;
      views_count?: number;
      monthly_revenue?: number;
      monetized?: boolean;
    }) => {
      const payload: any = {};
      if (input.subscribers !== undefined) payload.subscribers = input.subscribers;
      if (input.views_count !== undefined) payload.views_count = input.views_count;
      if (input.monthly_revenue !== undefined) payload.monthly_revenue = input.monthly_revenue;
      if (input.monetized !== undefined) payload.monetized = input.monetized;

      const { error } = await (supabase.from as any)("youtube_channels")
        .update(payload)
        .eq("id", input.id);
      if (error) throw error;

      // Recalculate total monthly revenue across channels and update media pillar
      const { data: allChannels } = await (supabase.from as any)("youtube_channels").select("monthly_revenue");
      if (allChannels) {
        const totalRev = allChannels.reduce((sum: number, ch: any) => sum + Number(ch.monthly_revenue || 0), 0);
        await (supabase.from as any)("pillars")
          .update({ current_value: totalRev })
          .eq("key", "media");
      }

      logAuditEvent({
        entity_type: "video",
        action: "UPDATE",
        title: "Channel Metrics Updated",
        details: `Updated channel telemetry (Subs: ${input.subscribers?.toLocaleString() ?? "-"}, Rev: $${input.monthly_revenue?.toLocaleString() ?? "-"})`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["youtube_channels"] });
      qc.invalidateQueries({ queryKey: ["pillars"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}


export function useUpdateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; [key: string]: any }) => {
      const { id, ...updates } = input;
      let updatedVideo: any = null;

      const { data, error } = await (supabase.from as any)("youtube_videos")
        .update(updates)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) {
        if (error.message && (error.message.includes("schema cache") || error.message.includes("column"))) {
          const safeUpdates: any = { ...updates };
          const extendedKeys = [
            "comments", "likes", "watch_time_hours", "script_done", "vo_done", "editing_done", "thumbnail_done",
            "title_variations", "concept_hook", "audience_intent", "target_length", "inspiration_links", "sponsorship_cta",
            "shot_list", "script_status", "aroll_done", "broll_done", "audio_done", "rough_cut_done", "fine_cut_done",
            "sound_done", "graphics_done", "color_done", "thumbnail_ab_notes", "seo_description", "tags_hashtags",
            "cards_done", "subtitles_done", "monetization_check_done", "preview_done", "community_post_draft",
            "shortform_repurpose_plan", "impressions", "avd_seconds", "retention_30s", "cpm", "shares", "subs_gained", "traffic_source"
          ];
          extendedKeys.forEach(k => delete safeUpdates[k]);

          const { data: fallbackData, error: fallbackErr } = await (supabase.from as any)("youtube_videos")
            .update(safeUpdates)
            .eq("id", id)
            .select("*")
            .single();
          if (fallbackErr) throw fallbackErr;
          updatedVideo = fallbackData;
        } else {
          throw error;
        }
      } else {
        updatedVideo = data;
      }

      // Automatically recalculate total views and monthly revenue for the video's channel
      if (updatedVideo && updatedVideo.channel_key) {
        const { data: channelVideos } = await (supabase.from as any)("youtube_videos")
          .select("views, revenue")
          .eq("channel_key", updatedVideo.channel_key);

        if (channelVideos) {
          const totalChanViews = channelVideos.reduce((sum: number, v: any) => sum + Number(v.views || 0), 0);
          const totalChanRev = channelVideos.reduce((sum: number, v: any) => sum + Number(v.revenue || 0), 0);

          await (supabase.from as any)("youtube_channels")
            .update({ views_count: totalChanViews, monthly_revenue: totalChanRev })
            .eq("key", updatedVideo.channel_key);
        }

        // Recalculate total media pillar revenue
        const { data: allChannels } = await (supabase.from as any)("youtube_channels").select("monthly_revenue");
        if (allChannels) {
          const totalRev = allChannels.reduce((sum: number, ch: any) => sum + Number(ch.monthly_revenue || 0), 0);
          await (supabase.from as any)("pillars").update({ current_value: totalRev }).eq("key", "media");
        }
      }

      logAuditEvent({
        entity_type: "video",
        action: "UPDATE",
        title: `Video Project: ${updates["title"] || "YouTube Video"}`,
        details: updates["stage"] ? `Production Stage: ${updates["stage"]}` : "Video production telemetry updated",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["youtube_videos"] });
      qc.invalidateQueries({ queryKey: ["youtube_channels"] });
      qc.invalidateQueries({ queryKey: ["pillars"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useBooks() {
  return useQuery({
    queryKey: ["book_database"],
    queryFn: async (): Promise<BookRow[]> => {
      const { data, error } = await (supabase.from as any)("book_database")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("Error loading books:", error);
        return [];
      }
      return (data ?? []) as BookRow[];
    },
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; author: string; reading_progress?: number; summary_notes?: string }) => {
      const userId = await requireUserId();
      const payload: any = {
        user_id: userId,
        title: input.title,
        author: input.author,
        reading_progress: input.reading_progress ?? 0,
      };
      if (input.summary_notes) payload.summary_notes = input.summary_notes;

      const { error } = await (supabase.from as any)("book_database").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["book_database"] }),
  });
}
