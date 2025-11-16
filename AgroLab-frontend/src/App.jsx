import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LabelPage from './components/Label/LabelPage';
import LabelPreview from "./components/Label/LabelPreview";
import Sidebar from "./components/common/Sidebar";
import MainContent from "./components/common/MainContent";
import ReagentManagement from "./components/Reagent/ReagentManagement";
import CultureManagement from "./components/Culture/CultureManagement";
import AddCultureForm from "./components/Culture/AddCultureForm";
import EquipmentManagement from "./components/Equipment/EquipmentManagement";
import CustomerManagement from "./components/Customer/CustomerManagement";
import SampleManagement from "./components/Sample/SampleManagement";
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginForm from "./components/Auth/LoginForm";
import RegistrationForm from "./components/Auth/RegistrationForm"; // Import the ProtectedRoute component
import AddEquipmentForm from "./components/Equipment/AddEquipmentForm"; // Import the AddEquipmentForm component
import AddReagentForm from './components/Reagent/AddReagentForm';
import AddSampleForm from "./components/Sample/AddSampleForm";
import AddCustomerForm from "./components/Customer/AddCustomerForm";
import PotatoAnalysisForm from "./components/Analysis/PotatoAnalysisForm";
import SeedAnalysisForm from "./components/Analysis/SeedAnalysisForm";
import SoilAnalysisForm from "./components/Analysis/SoilAnalysisForm";
import './styles.css';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to='/main' />} />
                <Route path="/label-preview" element={<LabelPreview />} />
                <Route path="/login" element={
                            <LoginForm/>
                } />
                <Route path="/main" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/register" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar/>
                            {(() => {
                                const user = JSON.parse(localStorage.getItem('user')); // Retrieve user
                                const isAdmin = user?.role?.toLowerCase() === 'admin'; // Check if user exists and is admin
                                return <RegistrationForm isAdmin={isAdmin} />;
                            })()}
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/main-content" element={
                    <ProtectedRoute>
                        <div className="bg-gray-100 flex">
                            <Sidebar />
                            <MainContent />
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/reagent-table" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1 p-4">
                                <ReagentManagement />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/reagents/add" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1 p-4 container mx-auto">
                                <AddReagentForm />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/reagents/edit" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1 p-4 container mx-auto">
                                <AddReagentForm />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/culture-table" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1 p-4">
                                <CultureManagement />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/add-culture" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1 p-4 container mx-auto">
                                <AddCultureForm onAdd={(culture) => console.log('New culture:', culture)} onClose={() => navigate('/culture-table')} />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/equipment-table" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1 p-4">
                                <EquipmentManagement />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/add-equipment" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1 p-4 container mx-auto">
                                <AddEquipmentForm onAdd={(equipment) => console.log('New equipment:', equipment)} onClose={() => navigate('/equipment-table')} />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/edit-equipment" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1 p-4 container mx-auto">
                                <AddEquipmentForm />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/customers" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1 p-4">
                                <CustomerManagement />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/customers/add" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1">
                                <AddCustomerForm />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/customers/edit" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1">
                                <AddCustomerForm />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/samples" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1 p-4">
                                <SampleManagement />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/samples/add" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1">
                                <AddSampleForm/>
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/samples/edit/:id" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1">
                                <AddSampleForm />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/label" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1 p-4 container mx-auto">
                                <LabelPage />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/analysis/potatoes" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1 p-4 container mx-auto">
                                <PotatoAnalysisForm />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/analysis/seeds" element={
                    <ProtectedRoute>
                        <div className="flex">
                            <Sidebar />
                            <div className="flex-1 p-4 container mx-auto">
                                <SeedAnalysisForm/>
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/analysis/soil" element={
                        <ProtectedRoute>
                            <div className="flex">
                                <Sidebar />
                                <div className="flex-1 p-4 container mx-auto">
                                    <SoilAnalysisForm/>
                                </div>
                            </div>
                        </ProtectedRoute>
                    } />
            </Routes>
        </BrowserRouter>
    );
};

export default App;