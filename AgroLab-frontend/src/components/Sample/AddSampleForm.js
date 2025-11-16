import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import SampleService from '../../services/SampleService';
import useSampleRepository from '../../Repository/SampleRepository';
import useCustomerRepository from "../../Repository/CustomerRepository";

const AddSampleForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {id} = useParams();
    const {sample} = location.state || {};
    const initialCategory = location.state?.category || 'seeds';
    const sampleRepo = useSampleRepository();
    const { customerList } = useCustomerRepository();

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [category, setCategory] = useState(initialCategory);

    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    // Define form fields for each category
    const initialFormData = {
        // Common fields
        category: initialCategory,

        // Seeds fields
        test_duration: '',
        test_object_name: '',
        sample_code: '',
        sample_selection: '',
        sampling_act: '',
        sampling_nd: '',
        harvest_year: '',
        // seed_category: '',
        research_direction: '',
        sampling_plan: '',
        additional_info: '',
        tuber_count: '',
        batch_number: '',
        batch_weight: '',
        storage_location: '',
        results_distribution: '',
        sample_storage_period: '',

        // Soil fields
        culture_id: '',
        inn_kpp: '',
        test_basis: '',
        sample_receipt_date: '',
        test_conditions: '',

        // Potatoes fields
        reproduction_id: '',
        upload_date: '',
        acceptance_file: '',

        // Plants fields
        inn: '',
        customer: '',
        contract_date: '',
        contract_number: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    
    useEffect(() => {
        if (id || sample) {
            setIsEditMode(true);

            if (sample) {
                setFormData({
                    ...initialFormData,
                    ...sample,
                    category: sample.category || initialCategory
                });
                setCategory(sample.category || initialCategory);
            } else if (id) {
                const fetchSample = async () => {
                    setIsLoading(true);
                    try {
                        
                        const samples = await sampleRepo.getSampleList();
                        const foundSample = samples.find(s => s.id === parseInt(id));

                        if (foundSample) {
                            setFormData({
                                ...initialFormData,
                                ...foundSample,
                                category: foundSample.category || initialCategory
                            });
                            setCategory(foundSample.category || initialCategory);
                        } else {
                            setErrors({general: 'Образец не найден'});
                            navigate('/samples');
                        }
                    } catch (error) {
                        console.error('Error fetching sample:', error);
                        setErrors({general: 'Ошибка при загрузке образца'});
                    } finally {
                        setIsLoading(false);
                    }
                };

                fetchSample();
            }
        }
    }, [id, sample, navigate, initialCategory]);

    useEffect(() => {
        if (customerSearchQuery) {
            const filtered = customerList.filter(customer =>
                customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase())
            );
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers([]);
        }
    }, [customerSearchQuery, customerList]);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploadedFile(file);
        setIsLoading(true);

        try {
            // Создаем FormData для отправки файла
            const formData = new FormData();
            formData.append('file', file);

            // Отправляем файл на сервер
            const response = await SampleService.uploadSampleFile(formData);

            // Заполняем форму данными, полученными от сервера
            if (response && response.data) {
                setFormData(prevData => ({
                    ...prevData,
                    ...response.data
                }));
            }
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            setErrors({
                upload: ''
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc']
            // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            // 'text/plain': ['.txt']
        },
        maxFiles: 1
    });

    const handleChange = (e) => {
        const {name, value} = e.target;

        if (name === 'category') {
            setCategory(value);
        }

        if (name === 'customer') {
            setCustomerSearchQuery(value);
            setShowCustomerDropdown(true);
        }

        setFormData({...formData, [name]: value});

        if (errors[name]) {
            setErrors({...errors, [name]: ''});
        }
    };

    const handleSelectCustomer = (customer) => {
        setFormData({
            ...formData,
            customer: customer.name,
            inn_kpp: customer.inn || ''
        });
        setCustomerSearchQuery('');
        setShowCustomerDropdown(false);
    };

    const validateForm = () => {
        const newErrors = {};

        // Common validations
        if (!formData.category) {
            newErrors.category = 'Категория обязательна';
        }

        // Common validations for all categories
        if (!formData.test_object_name) newErrors.test_object_name = 'Название объекта испытания обязательно';

        // Category-specific validations
        if (category === 'seeds') {
            if (!formData.test_duration) newErrors.test_duration = 'Срок испытания обязателен';
            if (!formData.sample_code) newErrors.sample_code = 'Код образца обязателен';
            if (!formData.harvest_year) newErrors.harvest_year = 'Год урожая обязателен';
            // if (!formData.seed_category) newErrors.seed_category = 'Категория семян обязательна';
            if (!formData.batch_number) newErrors.batch_number = '№ партии обязателен';
            if (!formData.batch_weight) newErrors.batch_weight = 'Масса партии обязательна';
            if (!formData.storage_location) newErrors.storage_location = 'Место хранения обязательно';
        } else if (category === 'soil') {
            if (!formData.culture_id) newErrors.culture_id = 'Культура обязательна';
            if (!formData.customer) newErrors.customer = 'Заказчик обязателен';
            if (!formData.inn_kpp) newErrors.inn_kpp = 'ИНН/КПП обязателен';
            if (!formData.test_basis) newErrors.test_basis = 'Основание для испытания обязательно';
            if (!formData.contract_number) newErrors.contract_number = 'Номер договора обязателен';
        } else if (category === 'potatoes') {
            if (!formData.culture_id) newErrors.culture_id = 'Культура обязательна';
            if (!formData.reproduction_id) newErrors.reproduction_id = 'Репродукция обязательна';
            if (!formData.customer) newErrors.customer = 'Заказчик обязателен';
            if (!formData.harvest_year) newErrors.harvest_year = 'Год урожая обязателен';
        } else if (category === 'plants') {
            if (!formData.culture_id) newErrors.culture_id = 'Культура обязательна';
            if (!formData.customer) newErrors.customer = 'Заказчик обязателен';
            if (!formData.inn) newErrors.inn = 'ИНН обязателен';
            if (!formData.research_direction) newErrors.research_direction = 'Направление исследования обязательно';
        }

        // Numeric validations
        if (formData.batch_weight && isNaN(formData.batch_weight)) {
            newErrors.batch_weight = 'Масса партии должна быть числом';
        }

        // Year validation
        if (formData.harvest_year) {
            const currentYear = new Date().getFullYear();
            if (isNaN(formData.harvest_year) ||
                parseInt(formData.harvest_year) < 1900 ||
                parseInt(formData.harvest_year) > currentYear) {
                newErrors.harvest_year = 'Год урожая должен быть числом между 1900 и текущим годом';
            }
        }

        if (!formData.customer) newErrors.customer = 'Заказчик обязателен';
        if (!formData.contract_number) newErrors.contract_number = 'Номер договора обязателен';
        if (!formData.contract_date) newErrors.contract_date = 'Дата договора обязательна';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //
    //     if (validateForm()) {
    //         try {
    //             setIsLoading(true);
    //             await SampleService.addSample(formData);
    //             navigate('/samples');
    //         } catch (error) {
    //             console.error('Ошибка при сохранении образца:', error);
    //             setErrors({
    //                 submit: 'Произошла ошибка при сохранении образца. Пожалуйста, попробуйте снова.'
    //             });
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }
    // };
   

const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit вызван");

    // Автозаполнение seed_category перед валидацией
    if (!formData.seed_category && formData.reproduction_id && category === 'seeds') {
        switch (formData.reproduction_id) {
            case 'ОС - оригинальная':
                formData.seed_category = 'ОС';
                break;
            case 'ЭС - элитная':
                formData.seed_category = 'ЭС';
                break;
            case 'РС - 1 репродукция':
                formData.seed_category = 'РС-1';
                break;
            case 'РСт - 2 репродукция':
                formData.seed_category = 'РС-2';
                break;
            default:
                formData.seed_category = '';
        }
    }

    const isValid = validateForm();
    console.log("Результат валидации:", isValid);

    if (!isValid) {
        console.warn("Форма не прошла валидацию:", errors);
        return;
    }

    try {
        setIsLoading(true);
        console.log("Данные перед отправкой:", formData);

        let response;
        if (isEditMode) {
            console.log("Режим редактирования, обновление образца");
            response = await sampleRepo.updateSample(formData.id, formData);
        } else {
            console.log("Добавление нового образца");
            response = await sampleRepo.addSample(formData);
        }

        console.log("Ответ от сервиса:", response);
        navigate('/samples');
    } catch (error) {
        console.error('Ошибка при сохранении образца:', error);

        // Подробности от Fetch API, если ошибка содержит тело
        if (error instanceof Response) {
            try {
                const text = await error.text();
                console.error('Ответ сервера:', text);
            } catch (parseErr) {
                console.error('Не удалось прочитать тело ответа:', parseErr);
            }
        }

        setErrors({
            submit: 'Произошла ошибка при сохранении образца. Пожалуйста, попробуйте снова.'
        });
    } finally {
        setIsLoading(false);
    }
};



    const handleCancel = () => {
        navigate('/samples');
    };

    // In AddSampleForm.jsx
    const handleCreateAnalysis = () => {
        if (!formData.category) {
            setErrors({category: 'Категория обязательна'});
        } else if (formData.category === 'plants') {
            alert('Растения не имеют четкого анализа');
        } else {
            // Pass the entire formData to the analysis page
            navigate(`/analysis/${formData.category}`, {
                state: { sample: formData }
            });
        }
    };

    const renderCategoryFields = () => {

        const commonFields = (
            <>
                {/* Поле выбора заказчика с поиском */}
                <div>
                    <label className="block mb-1 text-gray-700">Заказчик*</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="customer"
                            value={formData.customer}
                            onChange={handleChange}
                            onFocus={() => setShowCustomerDropdown(true)}
                            className={`w-full p-3 border ${errors.customer ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                            placeholder="Начните вводить имя заказчика..."
                            required
                        />
                        {showCustomerDropdown && customerSearchQuery && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <div
                                            key={customer.id}
                                            className="p-3 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleSelectCustomer(customer)}
                                        >
                                            {customer.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-gray-500">Заказчик не найден</div>
                                )}
                            </div>
                        )}
                        {errors.customer && <p className="text-red-500 text-sm mt-1">{errors.customer}</p>}
                    </div>
                </div>

                {/* Поле для номера договора */}
                <div>
                    <label className="block mb-1 text-gray-700">Номер договора*</label>
                    <input
                        type="text"
                        name="contract_number"
                        value={formData.contract_number}
                        onChange={handleChange}
                        className={`w-full p-3 border ${errors.contract_number ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                        required
                    />
                    {errors.contract_number && <p className="text-red-500 text-sm mt-1">{errors.contract_number}</p>}
                </div>

                {/* Поле для даты договора */}
                <div>
                    <label className="block mb-1 text-gray-700">Дата договора*</label>
                    <input
                        type="date"
                        name="contract_date"
                        value={formData.contract_date}
                        onChange={handleChange}
                        className={`w-full p-3 border ${errors.contract_date ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                        required
                    />
                    {errors.contract_date && <p className="text-red-500 text-sm mt-1">{errors.contract_date}</p>}
                </div>
            </>
        );

        switch (formData.category) {
            case 'seeds':
                return (
                    <>
                        {commonFields}
                        <div>
                            <label className="block mb-1 text-gray-700">Срок испытания*</label>
                            <input
                                type="text"
                                name="test_duration"
                                value={formData.test_duration}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.test_duration ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.test_duration &&
                                <p className="text-red-500 text-sm mt-1">{errors.test_duration}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Название объекта испытания*</label>
                            <input
                                type="text"
                                name="test_object_name"
                                value={formData.test_object_name}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.test_object_name ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.test_object_name &&
                                <p className="text-red-500 text-sm mt-1">{errors.test_object_name}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Код образца*</label>
                            <input
                                type="text"
                                name="sample_code"
                                value={formData.sample_code}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.sample_code ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.sample_code && <p className="text-red-500 text-sm mt-1">{errors.sample_code}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Отбор образца</label>
                            <input
                                type="text"
                                name="sample_selection"
                                value={formData.sample_selection}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Акт отбора</label>
                            <input
                                type="text"
                                name="sampling_act"
                                value={formData.sampling_act}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">НД на отбор</label>
                            <input
                                type="text"
                                name="sampling_nd"
                                value={formData.sampling_nd}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Год урожая*</label>
                            <input
                                type="text"
                                name="harvest_year"
                                value={formData.harvest_year}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.harvest_year ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.harvest_year && <p className="text-red-500 text-sm mt-1">{errors.harvest_year}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Репродукция*</label>
                            <select
                                name="reproduction_id"
                                value={formData.reproduction_id}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.reproduction_id ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            >
                                <option value="">Выберите репродукцию</option>
                                <option value="original">ОС - оригинальная</option>
                                <option value="elite">ЭС - элитная</option>
                                <option value="first">РС - 1 репродукция</option>
                                <option value="second">РСт - 2 репродукция</option>
                            </select>
                            {errors.reproduction_id &&
                                <p className="text-red-500 text-sm mt-1">{errors.reproduction_id}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Направление исследования</label>
                            <input
                                type="text"
                                name="research_direction"
                                value={formData.research_direction}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">План отбора</label>
                            <input
                                type="text"
                                name="sampling_plan"
                                value={formData.sampling_plan}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Дополнительная информация</label>
                            <textarea
                                name="additional_info"
                                value={formData.additional_info}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Количество клубней</label>
                            <input
                                type="number"
                                name="tuber_count"
                                value={formData.tuber_count}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">№ партии*</label>
                            <input
                                type="text"
                                name="batch_number"
                                value={formData.batch_number}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.batch_number ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.batch_number && <p className="text-red-500 text-sm mt-1">{errors.batch_number}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Масса партии*</label>
                            <input
                                type="text"
                                name="batch_weight"
                                value={formData.batch_weight}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.batch_weight ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.batch_weight && <p className="text-red-500 text-sm mt-1">{errors.batch_weight}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Место хранения*</label>
                            <input
                                type="text"
                                name="storage_location"
                                value={formData.storage_location}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.storage_location ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.storage_location &&
                                <p className="text-red-500 text-sm mt-1">{errors.storage_location}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Рассылка результатов</label>
                            <input
                                type="text"
                                name="results_distribution"
                                value={formData.results_distribution}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Срок хранения образца</label>
                            <input
                                type="text"
                                name="sample_storage_period"
                                value={formData.sample_storage_period}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </>
                );

            case 'soil':
                return (
                    <>
                        {commonFields}
                        <div>
                            <label className="block mb-1 text-gray-700">Культура*</label>
                            <input
                                type="text"
                                name="culture_id"
                                value={formData.culture_id}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.culture_id ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.culture_id && <p className="text-red-500 text-sm mt-1">{errors.culture_id}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">ИНН/КПП*</label>
                            <input
                                type="text"
                                name="inn_kpp"
                                value={formData.inn_kpp}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.inn_kpp ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.inn_kpp && <p className="text-red-500 text-sm mt-1">{errors.inn_kpp}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Основание для испытания*</label>
                            <input
                                type="text"
                                name="test_basis"
                                value={formData.test_basis}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.test_basis ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.test_basis && <p className="text-red-500 text-sm mt-1">{errors.test_basis}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Название объекта испытания*</label>
                            <input
                                type="text"
                                name="test_object_name"
                                value={formData.test_object_name}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.test_object_name ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.test_object_name &&
                                <p className="text-red-500 text-sm mt-1">{errors.test_object_name}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Отбор образца</label>
                            <input
                                type="text"
                                name="sample_selection"
                                value={formData.sample_selection}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Дата получения образца</label>
                            <input
                                type="date"
                                name="sample_receipt_date"
                                value={formData.sample_receipt_date}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Срок испытания</label>
                            <input
                                type="text"
                                name="test_duration"
                                value={formData.test_duration}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Акт отбора</label>
                            <input
                                type="text"
                                name="sampling_act"
                                value={formData.sampling_act}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Направление исследования</label>
                            <input
                                type="text"
                                name="research_direction"
                                value={formData.research_direction}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Условия испытания</label>
                            <textarea
                                name="test_conditions"
                                value={formData.test_conditions}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                rows="3"
                            />
                        </div>
                    </>
                );

            case 'potatoes':
                return (
                    <>
                        {commonFields}
                        <div>
                            <label className="block mb-1 text-gray-700">Культура*</label>
                            <input
                                type="text"
                                name="culture_id"
                                value={formData.culture_id}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.culture_id ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.culture_id && <p className="text-red-500 text-sm mt-1">{errors.culture_id}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Репродукция*</label>
                            <input
                                type="text"
                                name="reproduction_id"
                                value={formData.reproduction_id}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.reproduction_id ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.reproduction_id &&
                                <p className="text-red-500 text-sm mt-1">{errors.reproduction_id}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Дата загрузки</label>
                            <input
                                type="date"
                                name="upload_date"
                                value={formData.upload_date}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Файл приемки</label>
                            <input
                                type="text"
                                name="acceptance_file"
                                value={formData.acceptance_file}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">ИНН/КПП</label>
                            <input
                                type="text"
                                name="inn_kpp"
                                value={formData.inn_kpp}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Основание для испытания</label>
                            <input
                                type="text"
                                name="test_basis"
                                value={formData.test_basis}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Дата получения образца</label>
                            <input
                                type="date"
                                name="sample_receipt_date"
                                value={formData.sample_receipt_date}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Срок испытания</label>
                            <input
                                type="text"
                                name="test_duration"
                                value={formData.test_duration}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Название объекта испытания*</label>
                            <input
                                type="text"
                                name="test_object_name"
                                value={formData.test_object_name}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.test_object_name ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.test_object_name &&
                                <p className="text-red-500 text-sm mt-1">{errors.test_object_name}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Код образца</label>
                            <input
                                type="text"
                                name="sample_code"
                                value={formData.sample_code}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Отбор образца</label>
                            <input
                                type="text"
                                name="sample_selection"
                                value={formData.sample_selection}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Акт отбора</label>
                            <input
                                type="text"
                                name="sampling_act"
                                value={formData.sampling_act}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">НД на отбор</label>
                            <input
                                type="text"
                                name="sampling_nd"
                                value={formData.sampling_nd}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Год урожая*</label>
                            <input
                                type="text"
                                name="harvest_year"
                                value={formData.harvest_year}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.harvest_year ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.harvest_year && <p className="text-red-500 text-sm mt-1">{errors.harvest_year}</p>}
                        </div>
                    </>
                );

// Now let's add the 'plants' case:
            case 'plants':
                return (
                    <>
                        {commonFields}
                        <div>
                            <label className="block mb-1 text-gray-700">Культура*</label>
                            <input
                                type="text"
                                name="culture_id"
                                value={formData.culture_id}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.culture_id ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.culture_id && <p className="text-red-500 text-sm mt-1">{errors.culture_id}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Дата загрузки</label>
                            <input
                                type="date"
                                name="upload_date"
                                value={formData.upload_date}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Файл приемки</label>
                            <input
                                type="text"
                                name="acceptance_file"
                                value={formData.acceptance_file}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">ИНН*</label>
                            <input
                                type="text"
                                name="inn"
                                value={formData.inn}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.inn ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.inn && <p className="text-red-500 text-sm mt-1">{errors.inn}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Основание для испытания</label>
                            <input
                                type="text"
                                name="test_basis"
                                value={formData.test_basis}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Дата получения образца</label>
                            <input
                                type="date"
                                name="sample_receipt_date"
                                value={formData.sample_receipt_date}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Срок испытания</label>
                            <input
                                type="text"
                                name="test_duration"
                                value={formData.test_duration}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Название объекта испытания*</label>
                            <input
                                type="text"
                                name="test_object_name"
                                value={formData.test_object_name}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.test_object_name ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.test_object_name &&
                                <p className="text-red-500 text-sm mt-1">{errors.test_object_name}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Код образца</label>
                            <input
                                type="text"
                                name="sample_code"
                                value={formData.sample_code}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Отбор образца</label>
                            <input
                                type="text"
                                name="sample_selection"
                                value={formData.sample_selection}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Акт отбора</label>
                            <input
                                type="text"
                                name="sampling_act"
                                value={formData.sampling_act}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">НД на отбор</label>
                            <input
                                type="text"
                                name="sampling_nd"
                                value={formData.sampling_nd}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Направление исследования*</label>
                            <input
                                type="text"
                                name="research_direction"
                                value={formData.research_direction}
                                onChange={handleChange}
                                className={`w-full p-3 border ${errors.research_direction ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                required
                            />
                            {errors.research_direction &&
                                <p className="text-red-500 text-sm mt-1">{errors.research_direction}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">План отбора</label>
                            <input
                                type="text"
                                name="sampling_plan"
                                value={formData.sampling_plan}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-gray-700">Дополнительная информация</label>
                            <textarea
                                name="additional_info"
                                value={formData.additional_info}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                rows="3"
                            />
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="flex-1 p-8">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-6xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                    {isEditMode ? 'Редактирование образца' : 'Добавление нового образца'}
                </h2>

                {/* Drag and Drop зона */}
                <div className="mb-6">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'}`}
                    >
                        <input {...getInputProps()} />
                        {uploadedFile ? (
                            <div className="flex flex-col items-center">
                                <div className="text-green-600 mb-2">
                                    <i className="fas fa-check-circle text-2xl"></i>
                                </div>
                                <p className="text-gray-700">Файл загружен: {uploadedFile.name}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Перетащите другой файл или нажмите для замены
                                </p>
                            </div>
                        ) : isDragActive ? (
                            <div className="flex flex-col items-center">
                                <div className="text-orange-500 mb-2">
                                    <i className="fas fa-file-upload text-3xl"></i>
                                </div>
                                <p className="text-gray-700">Отпустите файл здесь...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="text-gray-400 mb-2">
                                    <i className="fas fa-file-upload text-3xl"></i>
                                </div>
                                <p className="text-gray-700">Перетащите файл сюда или нажмите для выбора</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Поддерживаемые форматы: DOC, DOCX
                                </p>
                            </div>
                        )}
                    </div>
                    {errors.upload && (
                        <p className="text-red-500 text-sm mt-1">{errors.upload}</p>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center my-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                            {/* Category selection field */}
                            <div>
                                <label className="block mb-1 text-gray-700">Категория образца*</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={`w-full p-3 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                    required
                                >
                                    <option value="">Выберите категорию</option>
                                    <option value="seeds">Семена</option>
                                    <option value="plants">Растения</option>
                                    <option value="potatoes">Картофель</option>
                                    <option value="soil">Почва</option>
                                </select>
                                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                            </div>

                            {/* Render fields based on selected category */}
                            {renderCategoryFields()}
                        </div>

                        {errors.submit && (
                            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                                {errors.submit}
                            </div>
                        )}

                        <div className="flex justify-end mt-8 space-x-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3 px-6 border border-gray-300 rounded-lg shadow"
                            >
                                Отмена
                            </button>

                            <button
                                type="button"
                                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow"
                                onClick={handleCreateAnalysis}
                            >
                                Провести анализ
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow"
                            >
                                {isLoading ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Сохранить')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );

};
export default AddSampleForm;