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
import LessonContent from './pages/LessonContent'
import AddContent from './pages/AddContent'
import Categories from './pages/Categories'
import AddCategory from './pages/AddCategory'
import Chapters from './pages/Chapters'
import AddChapter from './pages/AddChapter'
import ChapterLessons from './pages/ChapterLessons'
import CourseChapter from './pages/CourseChapter'
import CourseChapters from './pages/CourseChapters'
import EditChapter from './pages/EditChapter'
import Quizes from './pages/Quizes'
import EditQuiz from './pages/EditQuiz'
import UserList from './pages/UserList'
import AddLesson from './pages/AddLesson'
import AddQuiz from './pages/AddQuiz'
import AddUser from './pages/AddUser'
import Glossaries from './pages/Glossaries'
import AddGlossary from './pages/AddGlossary'
import EditLessonAdmin from './pages/EditLessonAdmin'
import AddLessonToChapter from './pages/AddLessonToChapter'
import AdminCategories from './pages/AdminCategories'
import AddAdminCategory from './pages/AddAdminCategory'
import EditAdminCategory from './pages/EditAdminCategory'
import Coupons from './pages/Coupons'
import AddCoupon from './pages/AddCoupon'
import EditCoupon from './pages/EditCoupon'
import CouponCategories from './pages/CouponCategories'
import AddCouponCategory from './pages/AddCouponCategory'
import EditCouponCategory from './pages/EditCouponCategory'
import GlossaryCategories from './pages/GlossaryCategories'
import AddGlossaryCategory from './pages/AddGlossaryCategory'
import AddContentPage from './pages/AddContentPage'
import EditContentPage from './pages/EditContentPage'
import NewsList from './pages/NewsList'
import NewsShow from './pages/NewsShow'
import EditNews from './pages/EditNews'
import Plans from './pages/Plans'
import AddPlan from './pages/AddPlan'
import EditPlan from './pages/EditPlan'
import ToolFlags from './pages/ToolFlags'
import FAQ from './pages/Faq'
import Pack from './pages/Pack'
import Notifications from './pages/Notifications'



import EmailTemplates from './pages/EmailTemplates'
import EditEmailTemplate from './pages/EditEmailTemplate'
import Broker from './pages/Broker.jsx'
import AddBroker from './pages/AddBroker'
import EditGlossary from './pages/EditGlossary.jsx'
import ViewGlossary from './pages/ViewGlossary.jsx'

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
        <Route path="/course/:courseId/add-category" element={<ProtectedRoute><AddCategory /></ProtectedRoute>} />
        <Route path="/course/:courseId/category/:categoryId/chapters" element={<ProtectedRoute><Chapters /></ProtectedRoute>} />
        <Route path="/course/:courseId/chapters" element={<ProtectedRoute><Chapters /></ProtectedRoute>} />
        <Route path="/course/:courseId/category/:categoryId/add-chapter" element={<ProtectedRoute><AddChapter /></ProtectedRoute>} />
        <Route path="/course/:courseId/add-chapter" element={<ProtectedRoute><AddChapter /></ProtectedRoute>} />
        <Route path="/course/:courseId/category/:categoryId/chapter/:chapterId/lessons" element={<ProtectedRoute><ChapterLessons /></ProtectedRoute>} />
        <Route path="/course/:courseId/category/:categoryId/chapter/:chapterId/add-lesson" element={<ProtectedRoute><AddLesson /></ProtectedRoute>} />
        <Route path="/course/:courseId/chapter/:chapterId/add-lesson" element={<ProtectedRoute><AddLesson /></ProtectedRoute>} />
        <Route path="/course/:courseId/category/:categoryId/chapter/:chapterId/lesson/:lessonId/edit" element={<ProtectedRoute><EditLesson /></ProtectedRoute>} />
        <Route path="/course/:courseId/chapter/:chapterId/lesson/:lessonId/edit" element={<ProtectedRoute><EditLesson /></ProtectedRoute>} />
        <Route path="/course/:courseId/chapter/:chapterId/lessons" element={<ProtectedRoute><ChapterLessons /></ProtectedRoute>} />
        <Route path="/courses/admin/course/:courseId/chapter" element={<ProtectedRoute><CourseChapter /></ProtectedRoute>} />
        <Route path="/courses/admin/course/:courseId/chapters" element={<ProtectedRoute><CourseChapters /></ProtectedRoute>} />
        <Route path="/courses/admin/course/:courseId/chapter/:chapterId/edit" element={<ProtectedRoute><EditChapter /></ProtectedRoute>} />
        <Route path="/lessons" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
        <Route path="/lesson/:lessonId/content" element={<ProtectedRoute><LessonContent /></ProtectedRoute>} />
        <Route path="/lesson/:lessonId/add-content" element={<ProtectedRoute><AddContent /></ProtectedRoute>} />
        <Route path="/quizes" element={<ProtectedRoute><Quizes /></ProtectedRoute>} />
        <Route path="/quiz/:quizId/edit" element={<ProtectedRoute><EditQuiz /></ProtectedRoute>} />
        <Route path="/user-list" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
        <Route path="/add-lesson" element={<ProtectedRoute><AddLesson /></ProtectedRoute>} />
        <Route path="/add-quiz" element={<ProtectedRoute><AddQuiz /></ProtectedRoute>} />
        <Route path="/add-user" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
        <Route path="/glossaries" element={<ProtectedRoute><Glossaries /></ProtectedRoute>} />
        
        <Route path="/add-glossary" element={<ProtectedRoute><AddGlossary mode="add" /></ProtectedRoute>} />
        <Route path="/glossaries/edit/:id" element={<ProtectedRoute><EditGlossary/></ProtectedRoute>} />
        <Route path="/glossaries/view/:id" element={<ProtectedRoute><ViewGlossary /></ProtectedRoute>} />
        
        <Route path="/courses/admin/lesson/:lessonId" element={<ProtectedRoute><EditLessonAdmin /></ProtectedRoute>} />
        <Route path="/courses/admin/chapter/:chapterId/lesson" element={<ProtectedRoute><AddLessonToChapter /></ProtectedRoute>} />
        <Route path="/admin-categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
        <Route path="/add-admin-category" element={<ProtectedRoute><AddAdminCategory /></ProtectedRoute>} />
        <Route path="/edit-admin-category/:categoryId" element={<ProtectedRoute><EditAdminCategory /></ProtectedRoute>} />
        <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
        <Route path="/add-coupon" element={<ProtectedRoute><AddCoupon /></ProtectedRoute>} />
        <Route path="/edit-coupon/:couponId" element={<ProtectedRoute><EditCoupon /></ProtectedRoute>} />
        <Route path="/coupon-categories" element={<ProtectedRoute><CouponCategories /></ProtectedRoute>} />
        <Route path="/add-coupon-category" element={<ProtectedRoute><AddCouponCategory /></ProtectedRoute>} />
        <Route path="/edit-coupon-category/:categoryId" element={<ProtectedRoute><EditCouponCategory /></ProtectedRoute>} />
        <Route path="/glossary-categories" element={<ProtectedRoute><GlossaryCategories /></ProtectedRoute>} />
        
        <Route path="/glossary-category/add" element={<ProtectedRoute><AddGlossaryCategory mode="add" /></ProtectedRoute>} />
        <Route path="/glossary-category/edit/:id" element={<ProtectedRoute><AddGlossaryCategory mode="edit" /></ProtectedRoute>} />
        <Route path="/glossary-category/view/:id" element={<ProtectedRoute><AddGlossaryCategory mode="view" /></ProtectedRoute>} />
       
        <Route path="/courses/admin/lesson/:lessonId/page/add" element={<ProtectedRoute><AddContentPage /></ProtectedRoute>} />
        <Route path="/courses/admin/lesson/:lessonId/page/:pageId/edit" element={<ProtectedRoute><EditContentPage /></ProtectedRoute>} />
        <Route path="/news" element={<ProtectedRoute><NewsList /></ProtectedRoute>} />
        <Route path="/news/:newsId" element={<ProtectedRoute><NewsShow /></ProtectedRoute>} />
        <Route path="/news/:newsId/edit" element={<ProtectedRoute><EditNews /></ProtectedRoute>} />
        <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
        <Route path="/add-plan" element={<ProtectedRoute><AddPlan /></ProtectedRoute>} />
        <Route path="/edit-plan/:planId" element={<ProtectedRoute><EditPlan /></ProtectedRoute>} />
        <Route path="/tool-flags" element={<ProtectedRoute><ToolFlags /></ProtectedRoute>} />
        <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
        <Route path="/packs" element={<ProtectedRoute><Pack /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/email-templates" element={<ProtectedRoute><EmailTemplates /></ProtectedRoute>} />
         <Route path="/Broker" element={<ProtectedRoute><Broker /></ProtectedRoute>} />
        <Route path="/broker/add" element={<ProtectedRoute><AddBroker /></ProtectedRoute>} />
        <Route path="/broker/edit/:id" element={<ProtectedRoute><AddBroker /></ProtectedRoute>} />
        <Route path="/edit-email-template/:id" element={<ProtectedRoute><EditEmailTemplate /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}

