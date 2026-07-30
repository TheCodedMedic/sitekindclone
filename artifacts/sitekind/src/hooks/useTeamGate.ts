import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type TeamGate =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "forbidden"; user: User }
  | { status: "member"; user: User };

export function useTeamGate(): TeamGate {
  const [gate, setGate] = useState<TeamGate>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (cancelled) return;
      const user = userData.user;
      if (!user) {
        setGate({ status: "signed-out" });
        return;
      }
      const { data: isMember, error } = await supabase.rpc("is_team_member", {
        _user_id: user.id,
      });
      if (cancelled) return;
      if (error || !isMember) {
        setGate({ status: "forbidden", user });
        return;
      }
      setGate({ status: "member", user });
    };
    void check();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void check();
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return gate;
}
