// CustomerManagement.jsx
import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerTable from './CustomerTable';
import useCustomerRepository from '../../Repository/CustomerRepository';
import ExportButton from "../common/ExportButton";
import SearchBar from "../common/SearchBar";

const CustomerManagement = () => {
    const {customerList, loading, error, deleteCustomer} = useCustomerRepository();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleDeleteCustomer = async (id) => {
        try {
            await deleteCustomer(id);
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Ошибка при удалении заказчика');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const filteredCustomers = customerList.filter(customer =>
        Object.values(customer).some(value =>
            value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <div className="container mx-4 p-4">
            <div className="flex flex-col w-full">
                <button
                    onClick={() =>  navigate('/customers/add')}
                    className="bg-gradient-to-r from-orange-400 to-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded self-end w-1/6 m-6"
                >
                    Добавить заказчика
                </button>

                <div className="flex mb-4 w-full">
                    <div className="w-2/3">
                        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
                    </div>
                    <div className="ml-auto py-2 rounded w-1/6 mr-6">
                        <ExportButton
                            data={customerList}
                            fileName="Заказчики"
                        />
                    </div>
                </div>
                <CustomerTable customerList={filteredCustomers} onDeleteCustomer={handleDeleteCustomer}/>
            </div>
        </div>
    );
};

export default CustomerManagement;