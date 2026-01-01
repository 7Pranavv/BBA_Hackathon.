import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { LearningPaths } from './pages/LearningPaths';
import { PathDetail } from './pages/PathDetail';
import { TopicDetail } from './pages/TopicDetail';
import { PracticeProblems } from './pages/PracticeProblems';
import { ProblemDetail } from './pages/ProblemDetail';
import { Progress } from './pages/Progress';
import { Discussions } from './pages/Discussions';
import { ThreadDetail } from './pages/ThreadDetail';
import { Mentorship } from './pages/Mentorship';
import { Subscriptions } from './pages/Subscriptions';
import { Cohorts } from './pages/Cohorts';
import { Donate } from './pages/Donate';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/paths"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <LearningPaths />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/paths/:pathId"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PathDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics/:topicId"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TopicDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/problems"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PracticeProblems />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/problems/:problemId"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProblemDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Progress />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/discussions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Discussions />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/discussions/:threadId"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ThreadDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentorship"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Mentorship />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Subscriptions />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cohorts"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Cohorts />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/donate"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Donate />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
