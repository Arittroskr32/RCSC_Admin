import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Blogs from './components/Blog/Blog';
import Members from './components/Member/Member';
import Activities from './components/Activities/Activities';
import Contact from './components/Contact/Contact';
import Login from './components/Login_signup/Login';
import Contact_details from './components/Contact/Contact_details';
import AddMember from './components/Member/AddMember';
import Member_display from './components/Member/Member_display';
import Post_blog from './components/Blog/Post_blog';
import Edit_blog from './components/Blog/Edit_blog';
import About from './components/About/About';
import SingleAnnouncement from './components/Home/single_announcement';
import SingleSponsor from './components/Home/single_sponsor';
import EditAchievement from './components/About/EditAchievement';
import Edit_developer from './components/About/Edit_developer';
import CreateDeveloper from './components/About/createDeveloper';
import CreateAchievement from "./components/About/createAchievement";
import Create_announcement from './components/Home/create_announcement';
import Create_sponsor from './components/Home/create_sponsor';
import Create_activities from './components/Activities/create_activities';
import Edit_activity from './components/Activities/Edit_activities';
import AllClubMembers from "./components/Home/all_club_Members";
import Newsletter from './components/Newsletter';


const App = () => {
  return (
    <div className='app'>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/edit_announcement/:id" element={<SingleAnnouncement /> } />
            <Route path="/edit_sponsor/:id" element={<SingleSponsor />} />
            <Route path="/create_announcement" element={<Create_announcement />} />
            <Route path="/create_sponsor" element={<Create_sponsor />} />
            <Route path="/all-club-members" element={<AllClubMembers />} />
            <Route path="/newsletter" element={<Newsletter />} />

            <Route path="/login" element={<Login />} />

            {/* About us */}
            <Route path="/about_us" element={<About />} />
            <Route path="/edit_achievement/:id" element={<EditAchievement />} />
            <Route path="/edit_developer/:id" element={<Edit_developer />} />
            <Route path="/create_achievement" element={<CreateAchievement />} />
            <Route path="/create_developer" element={<CreateDeveloper />} />

            <Route path="/blog" element={<Blogs />} />
            <Route path="/post_blog" element={<Post_blog />} />
            <Route path="/blog/:blogId" element={<Edit_blog />} /> 
            
            {/* Member routes */}
            <Route path="/member" element={<Members />} />
            <Route path='/addmember' element={<AddMember />} />
            <Route path="/member/:id" element={<Member_display />} />

            <Route path="/activities" element={<Activities />} />
            <Route path="/create_activities" element={<Create_activities />} />
            <Route path="/edit_activity/:id" element={<Edit_activity />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/contact/:contactId" element={<Contact_details />} />

            <Route path="*" element={<h1>Page not found</h1>} />
          </Routes>
    </div>
  );
};

export default App;
