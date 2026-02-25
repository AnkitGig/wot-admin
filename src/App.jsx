import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import AddCourse from './pages/AddCourse'
import EditCourse from './pages/EditCourse'
import CourseLessons from './pages/CourseLessons'
import EditLesson from './pages/EditLesson'
import Lessons from './pages/Lessons'
import Categories from './pages/Categories'
import Chapters from './pages/Chapters'
import ChapterLessons from './pages/ChapterLessons'
import Quizes from './pages/Quizes'
import UserList from './pages/UserList'
import AddLesson from './pages/AddLesson'
import AddQuiz from './pages/AddQuiz'
import AddUser from './pages/AddUser'
import Glossaries from './pages/Glossaries'
import AddGlossary from './pages/AddGlossary'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/add-course" element={<ProtectedRoute><AddCourse /></ProtectedRoute>} />
        <Route path="/edit-course/:courseId" element={<ProtectedRoute><EditCourse /></ProtectedRoute>} />
        <Route path="/course/:courseId/lessons" element={<ProtectedRoute><CourseLessons /></ProtectedRoute>} />
        <Route path="/course/:courseId/lesson/:lessonId/edit" element={<ProtectedRoute><EditLesson /></ProtectedRoute>} />
        <Route path="/course/:courseId/add-lesson" element={<ProtectedRoute><AddLesson /></ProtectedRoute>} />
        <Route path="/course/:courseId/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="/course/:courseId/category/:categoryId/chapters" element={<ProtectedRoute><Chapters /></ProtectedRoute>} />
        <Route path="/course/:courseId/category/:categoryId/chapter/:chapterId/lessons" element={<ProtectedRoute><ChapterLessons /></ProtectedRoute>} />
        <Route path="/lessons" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
        <Route path="/quizes" element={<ProtectedRoute><Quizes /></ProtectedRoute>} />
        <Route path="/user-list" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
        <Route path="/add-lesson" element={<ProtectedRoute><AddLesson /></ProtectedRoute>} />
        <Route path="/add-quiz" element={<ProtectedRoute><AddQuiz /></ProtectedRoute>} />
        <Route path="/add-user" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
        <Route path="/glossaries" element={<ProtectedRoute><Glossaries /></ProtectedRoute>} />
        <Route path="/add-glossary" element={<ProtectedRoute><AddGlossary /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}
