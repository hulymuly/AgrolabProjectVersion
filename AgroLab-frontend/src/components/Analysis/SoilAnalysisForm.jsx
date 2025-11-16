import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import SampleRepository from '../../Repository/SampleRepository';

const SoilAnalysisForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { sample } = location.state || {};
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [soilTypes, setSoilTypes] = useState([
        'Чернозем',
        'Подзолистая',
        'Дерново-подзолистая',
        'Серая лесная',
        'Каштановая',
        'Солонцы',
        'Солончаки',
        'Торфяная'
    ]);

    const [newSoilType, setNewSoilType] = useState('');
    const [showNewSoilTypeInput, setShowNewSoilTypeInput] = useState(false);

    const [formData, setFormData] = useState({
        // Basic sample info
        sampleId: '',
        sampleCode: '',
        batchNumber: '',
        storageLocation: '',

        // Soil analysis data based on GOST standards
        nitrateNitrogen020: '', // N-NO3 in 0-20 cm layer (GOST 26951-86)
        nitrateNitrogen2040: '', // N-NO3 in 20-40 cm layer (GOST 26951-86)
        mobilePotassium: '', // K2O (GOST 26204-91)
        mobilePhosphorus: '', // P2O5 (GOST 26204-91)
        exchangeableCalcium: '', // Ca (GOST 26487-85)
        exchangeableMagnesium: '', // Mg (GOST 26487-85)
        organicMatter: '', // Organic matter % (GOST 26213-2021)
        pHLevel: '', // pH (GOST 26483-85, GOST 26423-85)

        // Additional soil parameters
        soilType: '',
        soilTexture: '',
        humusContent: '',
        carbonateContent: '',
        electricalConductivity: '',
        cationExchangeCapacity: '',

        // Analysis results
        passesStandard: false,
        notes: ''
    });

    useEffect(() => {
        if (id || sample) {
            if (sample) {
                setFormData(prevData => ({
                    ...prevData,
                    sampleId: sample.id || '',
                    sampleCode: sample.sampleCode || '',
                    batchNumber: sample.batchNumber || '',
                    storageLocation: sample.storageLocation || '',
                    culture: sample.culture_id || sample.culture || ''
                }));
            } else if (id) {
                const fetchSample = async () => {
                    setIsLoading(true);
                    try {
                        const sampleRepo = SampleRepository();
                        const samples = await sampleRepo.getSampleList();
                        const foundSample = samples.find(s => s.id === parseInt(id));

                        if (foundSample) {
                            setFormData(prevData => ({
                                ...prevData,
                                sampleId: foundSample.id || '',
                                sampleCode: foundSample.sampleCode || '',
                                batchNumber: foundSample.batchNumber || '',
                                storageLocation: foundSample.storageLocation || ''
                            }));
                        } else {
                            setErrors({ general: 'Образец не найден' });
                            navigate('/samples');
                        }
                    } catch (error) {
                        console.error('Error fetching sample:', error);
                        setErrors({ general: 'Ошибка при загрузке образца' });
                    } finally {
                        setIsLoading(false);
                    }
                };

                fetchSample();
            }
        }
    }, [id, sample, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'soilType' && value === 'add_new') {
            setShowNewSoilTypeInput(true);
            return;
        }

        // Convert to number for numeric fields
        const numericFields = [
            'nitrateNitrogen020', 'nitrateNitrogen2040', 'mobilePotassium',
            'mobilePhosphorus', 'exchangeableCalcium', 'exchangeableMagnesium',
            'organicMatter', 'pHLevel', 'humusContent', 'carbonateContent',
            'electricalConductivity', 'cationExchangeCapacity'
        ];

        if (numericFields.includes(name)) {
            setFormData({
                ...formData,
                [name]: value === '' ? '' : parseFloat(value)
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleAddSoilType = () => {
        if (newSoilType.trim()) {
            setSoilTypes([...soilTypes, newSoilType.trim()]);
            setFormData({...formData, soilType: newSoilType.trim()});
            setNewSoilType('');
            setShowNewSoilTypeInput(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate numeric fields are positive
        const numericFields = [
            'nitrateNitrogen020', 'nitrateNitrogen2040', 'mobilePotassium',
            'mobilePhosphorus', 'exchangeableCalcium', 'exchangeableMagnesium',
            'organicMatter', 'humusContent', 'carbonateContent',
            'electricalConductivity', 'cationExchangeCapacity'
        ];

        numericFields.forEach(field => {
            const value = formData[field];
            if (value !== '' && (isNaN(value) || value < 0)) {
                newErrors[field] = 'Значение должно быть положительным числом';
            }
        });

        // Validate pH is between 0 and 14
        if (formData.pHLevel !== '' && (isNaN(formData.pHLevel) || formData.pHLevel < 0 || formData.pHLevel > 14)) {
            newErrors.pHLevel = 'pH должен быть от 0 до 14';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const analyzeResults = () => {
        // Analysis based on soil standards
        let passesStandard = true;
        const notes = [];

        // Check pH level (optimal range for most crops: 5.5-7.5)
        if (formData.pHLevel < 5.5) {
            passesStandard = false;
            notes.push('pH почвы слишком низкий (кислая почва), рекомендуется известкование');
        } else if (formData.pHLevel > 7.5) {
            passesStandard = false;
            notes.push('pH почвы слишком высокий (щелочная почва), рекомендуется гипсование');
        }

        // Check organic matter (minimum 2% for fertile soil)
        if (formData.organicMatter < 2) {
            passesStandard = false;
            notes.push('Низкое содержание органического вещества, рекомендуется внесение органических удобрений');
        }

        // Check mobile phosphorus (minimum 50 mg/kg for good fertility)
        if (formData.mobilePhosphorus < 50) {
            passesStandard = false;
            notes.push('Низкое содержание подвижного фосфора, рекомендуется внесение фосфорных удобрений');
        }

        // Check mobile potassium (minimum 80 mg/kg for good fertility)
        if (formData.mobilePotassium < 80) {
            passesStandard = false;
            notes.push('Низкое содержание подвижного калия, рекомендуется внесение калийных удобрений');
        }

        // Check nitrate nitrogen (optimal range: 10-20 mg/kg)
        if (formData.nitrateNitrogen020 < 10) {
            passesStandard = false;
            notes.push('Низкое содержание нитратного азота в слое 0-20 см, рекомендуется внесение азотных удобрений');
        }

        return {
            passesStandard,
            notes: notes.join('; ')
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsLoading(true);
            try {
                // Analyze the results
                const analysisResults = analyzeResults();

                // Update form data with analysis results
                const updatedFormData = {
                    ...formData,
                    passesStandard: analysisResults.passesStandard,
                    notes: analysisResults.notes
                };

                setFormData(updatedFormData);

                // Here you would typically save the analysis results
                // For example:
                const sampleRepo = SampleRepository();
                await sampleRepo.saveAnalysisResults(updatedFormData);

                // Show success message or navigate
                // alert(
                //     analysisResults.passesStandard
                //         ? 'Почва соответствует стандартам плодородия'
                //         : `Почва не соответствует стандартам плодородия. Рекомендации: ${analysisResults.notes}`
                // );

                navigate(-1);
            } catch (error) {
                console.error('Error analyzing sample:', error);
                setErrors({
                    submit: 'Произошла ошибка при анализе образца. Пожалуйста, попробуйте снова.'
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="flex-1 p-8">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-6xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                    Анализ образца почвы по ГОСТ
                </h2>

                {isLoading ? (
                    <div className="flex justify-center my-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Информация об образце</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block mb-1 text-gray-700">Код образца</label>
                                    <input
                                        type="text"
                                        name="sampleCode"
                                        value={formData.sampleCode}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">№ партии</label>
                                    <input
                                        type="text"
                                        name="batchNumber"
                                        value={formData.batchNumber}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Место хранения</label>
                                    <input
                                        type="text"
                                        name="storageLocation"
                                        value={formData.storageLocation}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Тип почвы</label>
                                    {!showNewSoilTypeInput ? (
                                        <select
                                            name="soilType"
                                            value={formData.soilType}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg"
                                        >
                                            <option value="">Выберите тип почвы</option>
                                            {soilTypes.map((type, index) => (
                                                <option key={index} value={type}>{type}</option>
                                            ))}
                                            <option value="add_new">+ Добавить новый тип почвы</option>
                                        </select>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={newSoilType}
                                                onChange={(e) => setNewSoilType(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg"
                                                placeholder="Введите тип"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddSoilType}
                                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:bg-orange-800 text-white px-4 p-3 rounded-lg"
                                            >
                                                +
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowNewSoilTypeInput(false)}
                                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-2 p-3 rounded-lg"
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Агрохимические показатели (ГОСТ)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block mb-1 text-gray-700">Нитратный азот (N-NO3) в слое 0-20 см,
                                        мг/кг</label>
                                    <input
                                        type="number"
                                        name="nitrateNitrogen020"
                                        value={formData.nitrateNitrogen020}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.nitrateNitrogen020 ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="0.1"
                                    />
                                    {errors.nitrateNitrogen020 &&
                                        <p className="text-red-500 text-sm mt-1">{errors.nitrateNitrogen020}</p>}
                                    <p className="text-sm text-gray-500 mt-1">ГОСТ 26951-86 (ионометрический метод)</p>
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Нитратный азот (N-NO3) в слое 20-40 см, мг/кг</label>
                                    <input
                                        type="number"
                                        name="nitrateNitrogen2040"
                                        value={formData.nitrateNitrogen2040}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.nitrateNitrogen2040 ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="0.1"
                                    />
                                    {errors.nitrateNitrogen2040 && <p className="text-red-500 text-sm mt-1">{errors.nitrateNitrogen2040}</p>}
                                    <p className="text-sm text-gray-500 mt-1">ГОСТ 26951-86 (ионометрический метод)</p>
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Подвижный фосфор (Р2О5), мг/кг</label>
                                    <input
                                        type="number"
                                        name="mobilePhosphorus"
                                        value={formData.mobilePhosphorus}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.mobilePhosphorus ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="0.1"
                                    />
                                    {errors.mobilePhosphorus && <p className="text-red-500 text-sm mt-1">{errors.mobilePhosphorus}</p>}
                                    <p className="text-sm text-gray-500 mt-1">ГОСТ 26204-91 (метод Чирикова)</p>
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Подвижный калий (К2О), мг/кг</label>
                                    <input
                                        type="number"
                                        name="mobilePotassium"
                                        value={formData.mobilePotassium}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.mobilePotassium ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="0.1"
                                    />
                                    {errors.mobilePotassium && <p className="text-red-500 text-sm mt-1">{errors.mobilePotassium}</p>}
                                    <p className="text-sm text-gray-500 mt-1">ГОСТ 26204-91 (метод Чирикова)</p>
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Обменный кальций (Са), ммоль/100г</label>
                                    <input
                                        type="number"
                                        name="exchangeableCalcium"
                                        value={formData.exchangeableCalcium}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.exchangeableCalcium ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="0.1"
                                    />
                                    {errors.exchangeableCalcium && <p className="text-red-500 text-sm mt-1">{errors.exchangeableCalcium}</p>}
                                    <p className="text-sm text-gray-500 mt-1">ГОСТ 26487-85 (метод ЦИНАО)</p>
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Обменный магний (Mg), ммоль/100г</label>
                                    <input
                                        type="number"
                                        name="exchangeableMagnesium"
                                        value={formData.exchangeableMagnesium}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.exchangeableMagnesium ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="0.1"
                                    />
                                    {errors.exchangeableMagnesium && <p className="text-red-500 text-sm mt-1">{errors.exchangeableMagnesium}</p>}
                                    <p className="text-sm text-gray-500 mt-1">ГОСТ 26487-85 (метод ЦИНАО)</p>
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Органическое вещество, %</label>
                                    <input
                                        type="number"
                                        name="organicMatter"
                                        value={formData.organicMatter}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.organicMatter ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.organicMatter && <p className="text-red-500 text-sm mt-1">{errors.organicMatter}</p>}
                                    <p className="text-sm text-gray-500 mt-1">ГОСТ 26213-2021</p>
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Реакция среды почвенного раствора (pH)</label>
                                    <input
                                        type="number"
                                        name="pHLevel"
                                        value={formData.pHLevel}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.pHLevel ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="14"
                                        step="0.1"
                                    />
                                    {errors.pHLevel && <p className="text-red-500 text-sm mt-1">{errors.pHLevel}</p>}
                                    <p className="text-sm text-gray-500 mt-1">ГОСТ 26483-85, ГОСТ 26423-85</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Дополнительные показатели</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block mb-1 text-gray-700">Гранулометрический состав</label>
                                    <select
                                        name="soilTexture"
                                        value={formData.soilTexture}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                    >
                                        <option value="">Выберите состав</option>
                                        <option value="Песчаная">Песчаная</option>
                                        <option value="Супесчаная">Супесчаная</option>
                                        <option value="Легкосуглинистая">Легкосуглинистая</option>
                                        <option value="Среднесуглинистая">Среднесуглинистая</option>
                                        <option value="Тяжелосуглинистая">Тяжелосуглинистая</option>
                                        <option value="Глинистая">Глинистая</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Содержание гумуса, %</label>
                                    <input
                                        type="number"
                                        name="humusContent"
                                        value={formData.humusContent}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.humusContent ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.humusContent && <p className="text-red-500 text-sm mt-1">{errors.humusContent}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Содержание карбонатов, %</label>
                                    <input
                                        type="number"
                                        name="carbonateContent"
                                        value={formData.carbonateContent}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.carbonateContent ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.carbonateContent && <p className="text-red-500 text-sm mt-1">{errors.carbonateContent}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Электропроводность, мСм/см</label>
                                    <input
                                        type="number"
                                        name="electricalConductivity"
                                        value={formData.electricalConductivity}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.electricalConductivity ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="0.01"
                                    />
                                    {errors.electricalConductivity && <p className="text-red-500 text-sm mt-1">{errors.electricalConductivity}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Емкость катионного обмена, мг-экв/100г</label>
                                    <input
                                        type="number"
                                        name="cationExchangeCapacity"
                                        value={formData.cationExchangeCapacity}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.cationExchangeCapacity ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="0.1"
                                    />
                                    {errors.cationExchangeCapacity && <p className="text-red-500 text-sm mt-1">{errors.cationExchangeCapacity}</p>}
                                </div>
                            </div>
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
                                type="submit"
                                disabled={isLoading}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow"
                            >
                                {isLoading ? 'Анализ...' : 'Провести анализ'}
                            </button>
                        </div>

                        {formData.notes && (
                            <div className={`mt-6 p-4 rounded-lg ${formData.passesStandard ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                <h3 className="font-semibold mb-2">
                                    {formData.passesStandard ? 'Почва соответствует стандартам плодородия' : 'Почва не соответствует стандартам плодородия'}
                                </h3>
                                {!formData.passesStandard && (
                                    <p>{formData.notes}</p>
                                )}
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default SoilAnalysisForm;