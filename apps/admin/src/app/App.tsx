/**
 * Root Admin Dashboard component — route tree.
 *
 * Per docs/05-frontend-architecture.md, Section 9: /login is a
 * standalone route outside the protected layout; every other route sits
 * behind ProtectedRoute -> DashboardLayout, matching this prompt's
 * Part 5 requirements (login page, protected routes, dashboard layout,
 * navigation) and Part 6 (one route per management screen).
 *
 * On mount, attempts a silent session restore from a stored refresh
 * token (authStore's localStorage-persisted value) so a page reload
 * doesn't force a fresh login — see src/hooks/useAuth.ts and
 * src/stores/authStore.ts's module docstrings for the security caveat
 * this implies (a UX convenience, never the actual security boundary).
 */
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MusicPage from "@/modules/music/MusicPage";
import { authApi } from "@/api/authApi";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AchievementsListPage from "@/modules/achievements/AchievementsListPage";
import DashboardPage from "@/modules/dashboard/DashboardPage";
import LoginPage from "@/modules/dashboard/LoginPage";
import LettersListPage from "@/modules/letters/LettersListPage";
import MediaListPage from "@/modules/media/MediaListPage";
import MemoriesListPage from "@/modules/memories/MemoriesListPage";
import QuotesListPage from "@/modules/quotes/QuotesListPage";
import TimelineListPage from "@/modules/timeline/TimelineListPage";
import UnlocksListPage from "@/modules/unlock-conditions/UnlocksListPage";
import { useAuthStore } from "@/stores/authStore";
import HiddenObjectEditorPage 
from "@/modules/games/hidden-objects/HiddenObjectEditorPage";
import CupidArrowEditorPage
from "@/modules/games/cupid-arrow/CupidArrowEditorPage";
import HeartRushEditorPage
from "@/modules/games/heart-rush/HeartRushEditorPage";

import ThemeEditor
from "@/modules/games/pooja-kitchen/ThemeEditor";

import FoodEditor
from "@/modules/games/pooja-kitchen/FoodEditor";

import CustomerEditor
from "@/modules/games/pooja-kitchen/CustomerEditor";

import LevelEditor
from "@/modules/games/pooja-kitchen/LevelEditor";

import PoojaKitchenPage
from "@/modules/games/pooja-kitchen/PoojaKitchenPage";

import PoojaKitchenEditorPage
from "@/modules/games/pooja-kitchen/PoojaKitchenEditorPage";

function useSessionHydration() {
  useEffect(() => {
    const { getStoredRefreshToken, setSession, clearSession } = useAuthStore.getState();
    const storedRefreshToken = getStoredRefreshToken();
    if (!storedRefreshToken) {
      clearSession();
      return;
    }
    authApi
      .refresh(storedRefreshToken)
      .then((tokens) => setSession(tokens.access_token, tokens.refresh_token))
      .catch(() => clearSession());
  }, []);
}

export default function App() {
  useSessionHydration();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/media" element={<MediaListPage />} />
            <Route
              path="/games/hidden-objects"
              element={<HiddenObjectEditorPage />}
              />
            <Route
              path="/games/cupid-arrow"
              element={<CupidArrowEditorPage />}
            />
            <Route
              path="/games/heart-rush"
              element={<HeartRushEditorPage />}
            />
            <Route
              path="/games/pooja-kitchen"
              element={<PoojaKitchenEditorPage />}
            />
            <Route
              path="/games/pooja-kitchen/themes"
              element={<ThemeEditor />}
            />

            <Route
              path="/games/pooja-kitchen/foods"
              element={<FoodEditor />}
            />

            <Route
              path="/games/pooja-kitchen/customers"
              element={<CustomerEditor />}
            />

            <Route
              path="/games/pooja-kitchen/levels"
              element={<LevelEditor />}
            />
            <Route
            path="/games/pooja-kitchen"
            element={<PoojaKitchenPage />}
            />
            <Route path="/memories" element={<MemoriesListPage />} />
            <Route path="/timeline" element={<TimelineListPage />} />
            <Route path="/letters" element={<LettersListPage />} />
            <Route path="/quotes" element={<QuotesListPage />} />
            <Route path="/achievements" element={<AchievementsListPage />} />
            <Route path="/unlocks" element={<UnlocksListPage />} />
            <Route
                path="/music"
                element={
                      <MusicPage />
                }
              />
          </Route>
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
