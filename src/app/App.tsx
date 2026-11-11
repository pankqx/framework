import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Loader } from '@/components/Loader'
import { AppShell } from '@/components/AppShell'
import { useLearner } from '@/modules/learner/hooks'

const LandingPage = lazy(() => import('@/modules/landing/LandingPage'))
const OnboardingPage = lazy(() => import('@/modules/onboarding/OnboardingPage'))
const DashboardPage = lazy(() => import('@/modules/dashboard/DashboardPage'))
const CurriculumPage = lazy(() => import('@/modules/curriculum/CurriculumPage'))
const SettingsPage = lazy(() => import('@/modules/settings/SettingsPage'))
const LessonPage = lazy(() => import('@/modules/lessons/LessonPage'))
const ReviewPage = lazy(() => import('@/modules/revision/ReviewPage'))
const KanjiPage = lazy(() => import('@/modules/kanji/KanjiPage'))
const MorePage = lazy(() => import('@/modules/dashboard/MorePage'))

/** The learning app needs a profile; without one, onboarding comes first. */
function RequireLearner() {
  const { data, isPending } = useLearner()
  if (isPending) return <Loader />
  if (!data?.profile || !data.goals) return <Navigate to="/onboarding" replace />
  return (
    <AppShell>
      <Suspense fallback={<Loader inline />}>
        <Outlet />
      </Suspense>
    </AppShell>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function App() {
  return (
    <Suspense fallback={<Loader />}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/app" element={<RequireLearner />}>
          <Route index element={<DashboardPage />} />
          <Route path="curriculum" element={<CurriculumPage />} />
          <Route path="lesson/:slug" element={<LessonPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="kanji" element={<KanjiPage />} />
          <Route path="more" element={<MorePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
