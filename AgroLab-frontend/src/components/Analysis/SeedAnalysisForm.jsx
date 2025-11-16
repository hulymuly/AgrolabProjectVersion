import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import SampleRepository from '../../Repository/SampleRepository';
import CultureRepository from "../../Repository/CultureRepository";

const SeedAnalysisForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { sample } = location.state || {};
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        // Basic sample info
        sampleId: '',
        sampleCode: '',
        variety: '',
        batchNumber: '',
        culture: '',

        // Seed analysis data
        germinationEnergy: 0,
        germination: 0,
        seedPurity: 0,
        waste: 0,
        otherCropSeeds: 0,
        oatSeeds: 0,
        weedSeeds: 0,
        botanicalComposition: '',
        quarantineSeeds: 0,
        ergotSclerotia: 0,
        wheatNematodeGalls: 0,
        smutFormations: 0,
        alternaria: 0,
        fusarium: 0,
        helminthosporium: 0,
        septoria: 0,
        yellowSpot: 0,
        nigrosporiosis: 0,
        blackEar: 0,
        mold: 0,
        totalDiseaseInfection: 0,
        thousandSeedWeight: 0,

        // Analysis results
        passesStandard: false,
        notes: ''
    });

    // useEffect(() => {
    //     if (id || sample) {
    //         if (sample) {
    //             setFormData(prevData => ({
    //                 ...prevData,
    //                 sampleId: sample.id || '',
    //                 sampleCode: sample.sampleCode || '',
    //                 variety: sample.variety || '',
    //                 batchNumber: sample.batchNumber || '',
    //                 culture: sample.culture || ''
    //             }));
    //         } else if (id) {
    //             const fetchSample = async () => {
    //                 setIsLoading(true);
    //                 try {
    //                     const sampleRepo = useSampleRepository();
    //                     const samples = await sampleRepo.getSampleList();
    //                     const foundSample = samples.find(s => s.id === parseInt(id));
    //
    //                     if (foundSample) {
    //                         setFormData(prevData => ({
    //                             ...prevData,
    //                             sampleId: foundSample.id || '',
    //                             sampleCode: foundSample.sampleCode || '',
    //                             variety: foundSample.variety || '',
    //                             batchNumber: foundSample.batchNumber || '',
    //                             culture: foundSample.culture || ''
    //                         }));
    //                     } else {
    //                         setErrors({ general: 'Образец не найден' });
    //                         navigate('/samples');
    //                     }
    //                 } catch (error) {
    //                     console.error('Error fetching sample:', error);
    //                     setErrors({ general: 'Ошибка при загрузке образца' });
    //                 } finally {
    //                     setIsLoading(false);
    //                 }
    //             };
    //
    //             fetchSample();
    //         }
    //     }
    // }, [id, sample, navigate]);

    useEffect(() => {
        if (id || sample) {
            if (sample) {
                setFormData(prevData => ({
                    ...prevData,
                    sampleId: sample.id || '',
                    sampleCode: sample.sampleCode || '',
                    variety: sample.variety || '',
                    batchNumber: sample.batchNumber || '',
                    culture: sample.culture || sample.culture_id || '',
                    reproduction: sample.reproduction_id || sample.reproduction || ''
                }));

                // Fetch norms for this culture if available
                if (sample.culture || sample.culture_id) {
                    fetchCultureNorms(sample.culture || sample.culture_id, sample.reproduction || sample.reproduction_id || 'elite');
                }
            } else if (id) {
                const fetchSample = async () => {
                    setIsLoading(true);
                    try {
                        const sampleRepo = useSampleRepository();
                        const samples = await sampleRepo.getSampleList();
                        const foundSample = samples.find(s => s.id === parseInt(id));

                        if (foundSample) {
                            setFormData(prevData => ({
                                ...prevData,
                                sampleId: foundSample.id || '',
                                sampleCode: foundSample.sampleCode || '',
                                variety: foundSample.variety || '',
                                batchNumber: foundSample.batchNumber || '',
                                culture: foundSample.culture || foundSample.culture_id || ''
                            }));

                            // Fetch norms for this culture if available
                            if (sample.culture_id || sample.culture) {
                                fetchCultureNorms(sample.culture_id || sample.culture,
                                    sample.reproduction_id || sample.reproduction || 'elite');
                            }
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

    const fetchCultureNorms = async (cultureName, reproduction) => {
        try {
            const norms = await CultureRepository.getNormsByCulture(cultureName, 'seeds', reproduction);
            if (norms) {
                // Update validation criteria based on norms
                setValidationCriteria(norms);
            }
        } catch (error) {
            console.error('Error fetching culture norms:', error);
        }
    };

    const [validationCriteria, setValidationCriteria] = useState({
        germination: 92, // Всхожесть
        seedPurity: 98.0, // Чистота семян
        otherCropSeeds: 40, // Семена других культурных растений
        weedSeeds: 20, // Семена сорных растений
        quarantineSeeds: 0, // Семена карантинных растений
        ergotSclerotia: 0, // Склероции спорыньи
        wheatNematodeGalls: 0, // Галлы пшеничной нематоды
        smutFormations: 0, // Головневые образования
        germinationEnergy: 0, // Энергия прорастания
        waste: 100, // Отход
        oatSeeds: 40, // Овес (часть других культурных растений)
        alternaria: 100, // Альтернариоз
        fusarium: 100, // Фузариоз
        helminthosporium: 100, // Гельминтоспориоз
        septoria: 100, // Септориоз
        yellowSpot: 100, // Желтая пятнистость
        nigrosporiosis: 100, // Нитроспориоз
        blackEar: 100, // Чернь колоса
        mold: 100, // Плесневение
        totalDiseaseInfection: 100, // Общая зараженность болезнями
        thousandSeedWeight: 0 // Масса 1000 семян
    });


    const handleChange = (e) => {
        const { name, value } = e.target;

        // Convert to number for numeric fields
        const numericFields = [
            'germinationEnergy', 'germination', 'seedPurity', 'waste', 'otherCropSeeds',
            'oatSeeds', 'weedSeeds', 'quarantineSeeds', 'ergotSclerotia', 'wheatNematodeGalls',
            'smutFormations', 'alternaria', 'fusarium', 'helminthosporium', 'septoria',
            'yellowSpot', 'nigrosporiosis', 'blackEar', 'mold', 'totalDiseaseInfection',
            'thousandSeedWeight'
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

    const validateForm = () => {
        const newErrors = {};

        // Validate numeric fields are between 0 and 100 for percentage fields
        const percentageFields = [
            'germinationEnergy', 'germination', 'seedPurity', 'waste', 'totalDiseaseInfection'
        ];

        percentageFields.forEach(field => {
            const value = formData[field];
            if (value === '' || isNaN(value)) {
                newErrors[field] = 'Поле должно содержать число';
            } else if (value < 0 || value > 100) {
                newErrors[field] = 'Значение должно быть от 0 до 100';
            }
        });

        // Validate non-negative fields
        const nonNegativeFields = [
            'otherCropSeeds', 'oatSeeds', 'weedSeeds', 'quarantineSeeds', 'ergotSclerotia',
            'wheatNematodeGalls', 'smutFormations', 'alternaria', 'fusarium', 'helminthosporium',
            'septoria', 'yellowSpot', 'nigrosporiosis', 'blackEar', 'mold', 'thousandSeedWeight'
        ];

        nonNegativeFields.forEach(field => {
            const value = formData[field];
            if (value === '' || isNaN(value)) {
                newErrors[field] = 'Поле должно содержать число';
            } else if (value < 0) {
                newErrors[field] = 'Значение должно быть положительным числом';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const analyzeResults = () => {
        // Analysis based on the provided standards
        let passesStandard = true;
        const notes = [];

        // Check germination (using norm from culture)
        if (formData.germination < validationCriteria.germination) {
            passesStandard = false;
            notes.push(`Всхожесть ниже допустимой нормы (мин. ${validationCriteria.germination}%)`);
        }

        // Check seed purity (using norm from culture)
        if (formData.seedPurity < validationCriteria.seedPurity) {
            passesStandard = false;
            notes.push(`Чистота семян ниже допустимой нормы (мин. ${validationCriteria.seedPurity}%)`);
        }

        // Check other crop seeds (using norm from culture)
        if (formData.otherCropSeeds > validationCriteria.otherCropSeeds) {
            passesStandard = false;
            notes.push(`Превышено допустимое количество семян других культурных растений (макс. ${validationCriteria.otherCropSeeds} шт/кг)`);
        }

        // Check weed seeds (using norm from culture)
        if (formData.weedSeeds > validationCriteria.weedSeeds) {
            passesStandard = false;
            notes.push(`Превышено допустимое количество семян сорных растений (макс. ${validationCriteria.weedSeeds} шт/кг)`);
        }

        // Check quarantine seeds (not allowed)
        if (formData.quarantineSeeds > validationCriteria.quarantineSeeds) {
            passesStandard = false;
            notes.push('Наличие семян карантинных растений не допускается');
        }

        // Check ergot sclerotia (not allowed)
        if (formData.ergotSclerotia > validationCriteria.ergotSclerotia) {
            passesStandard = false;
            notes.push('Наличие склероций спорыньи не допускается');
        }

        // Check wheat nematode galls (not allowed)
        if (formData.wheatNematodeGalls > validationCriteria.wheatNematodeGalls) {
            passesStandard = false;
            notes.push('Наличие галлов пшеничной нематоды не допускается');
        }

        // Check smut formations (not allowed)
        if (formData.smutFormations > validationCriteria.smutFormations) {
            passesStandard = false;
            notes.push('Наличие головневых образований не допускается');
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

                navigate("/samples");

                // Analyze the results
                const analysisResults = analyzeResults();

                // Update form data with analysis results
                const updatedFormData = {
                    ...formData,
                    passesStandard: analysisResults.passesStandard,
                    notes: analysisResults.notes
                };

                setFormData(updatedFormData);

                const sampleRepo = useSampleRepository();
                await sampleRepo.saveAnalysisResults(updatedFormData);

                // Show success message or navigate
                // alert(
                //     analysisResults.passesStandard
                //         ? 'Образец соответствует стандарту'
                //         : `Образец не соответствует стандарту. Причины: ${analysisResults.notes}`
                // );

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
                    Анализ образца семян
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
                                    <label className="block mb-1 text-gray-700">Культура</label>
                                    <input
                                        type="text"
                                        name="culture"
                                        value={formData.culture}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-gray-700">Сорт</label>
                                    <input
                                        type="text"
                                        name="variety"
                                        value={formData.variety}
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
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Основные показатели качества семян</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block mb-1 text-gray-700">Энергия прорастания, %</label>
                                    <input
                                        type="number"
                                        name="germinationEnergy"
                                        value={formData.germinationEnergy}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.germinationEnergy ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.germinationEnergy && <p className="text-red-500 text-sm mt-1">{errors.germinationEnergy}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Всхожесть, %</label>
                                    <input
                                        type="number"
                                        name="germination"
                                        value={formData.germination}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.germination ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.germination && <p className="text-red-500 text-sm mt-1">{errors.germination}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Чистота семян, %</label>
                                    <input
                                        type="number"
                                        name="seedPurity"
                                        value={formData.seedPurity}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.seedPurity ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.seedPurity && <p className="text-red-500 text-sm mt-1">{errors.seedPurity}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Отход, %</label>
                                    <input
                                        type="number"
                                        name="waste"
                                        value={formData.waste}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.waste ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.waste && <p className="text-red-500 text-sm mt-1">{errors.waste}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Масса 1000 семян, г</label>
                                    <input
                                        type="number"
                                        name="thousandSeedWeight"
                                        value={formData.thousandSeedWeight}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.thousandSeedWeight ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="0.1"
                                    />
                                    {errors.thousandSeedWeight && <p className="text-red-500 text-sm mt-1">{errors.thousandSeedWeight}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Содержание семян других растений (шт/кг)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block mb-1 text-gray-700">Семена других культурных растений (всего)</label>
                                    <input
                                        type="number"
                                        name="otherCropSeeds"
                                        value={formData.otherCropSeeds}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.otherCropSeeds ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="1"
                                    />
                                    {errors.otherCropSeeds && <p className="text-red-500 text-sm mt-1">{errors.otherCropSeeds}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Овес</label>
                                    <input
                                        type="number"
                                        name="oatSeeds"
                                        value={formData.oatSeeds}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.oatSeeds ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="1"
                                    />
                                    {errors.oatSeeds && <p className="text-red-500 text-sm mt-1">{errors.oatSeeds}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Семян сорных растений (всего)</label>
                                    <input
                                        type="number"
                                        name="weedSeeds"
                                        value={formData.weedSeeds}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.weedSeeds ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="1"
                                    />
                                    {errors.weedSeeds && <p className="text-red-500 text-sm mt-1">{errors.weedSeeds}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Ботанический состав</label>
                                    <textarea
                                        name="botanicalComposition"
                                        value={formData.botanicalComposition}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.botanicalComposition ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        rows="3"
                                    />
                                    {errors.botanicalComposition && <p className="text-red-500 text-sm mt-1">{errors.botanicalComposition}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Карантинные объекты</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block mb-1 text-gray-700">Семян карантинных растений</label>
                                    <input
                                        type="number"
                                        name="quarantineSeeds"
                                        value={formData.quarantineSeeds}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.quarantineSeeds ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="1"
                                    />
                                    {errors.quarantineSeeds && <p className="text-red-500 text-sm mt-1">{errors.quarantineSeeds}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Склероции спорыньи</label>
                                    <input
                                        type="number"
                                        name="ergotSclerotia"
                                        value={formData.ergotSclerotia}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.ergotSclerotia ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="1"
                                    />
                                    {errors.ergotSclerotia && <p className="text-red-500 text-sm mt-1">{errors.ergotSclerotia}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Галлы пшеничной нематоды</label>
                                    <input
                                        type="number"
                                        name="wheatNematodeGalls"
                                        value={formData.wheatNematodeGalls}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.wheatNematodeGalls ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="1"
                                    />
                                    {errors.wheatNematodeGalls && <p className="text-red-500 text-sm mt-1">{errors.wheatNematodeGalls}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Головневые образования</label>
                                    <input
                                        type="number"
                                        name="smutFormations"
                                        value={formData.smutFormations}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.smutFormations ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        step="1"
                                    />
                                    {errors.smutFormations && <p className="text-red-500 text-sm mt-1">{errors.smutFormations}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Зараженность болезнями, %</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block mb-1 text-gray-700">Альтернариоз (p. Alternaria)</label>
                                    <input
                                        type="number"
                                        name="alternaria"
                                        value={formData.alternaria}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.alternaria ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.alternaria && <p className="text-red-500 text-sm mt-1">{errors.alternaria}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Фузариоз (р. Fusarium)</label>
                                    <input
                                        type="number"
                                        name="fusarium"
                                        value={formData.fusarium}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.fusarium ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.fusarium && <p className="text-red-500 text-sm mt-1">{errors.fusarium}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Гельминтоспориоз (Cochilobolus sativus)</label>
                                    <input
                                        type="number"
                                        name="helminthosporium"
                                        value={formData.helminthosporium}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.helminthosporium ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.helminthosporium && <p className="text-red-500 text-sm mt-1">{errors.helminthosporium}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700 mt-6">Септориоз (р. Septoria)</label>
                                    <input
                                        type="number"
                                        name="septoria"
                                        value={formData.septoria}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.septoria ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.septoria && <p className="text-red-500 text-sm mt-1">{errors.septoria}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Желтая пятнистость, пиренофороз (Pyrenophora tritici-repentis)</label>
                                    <input
                                        type="number"
                                        name="yellowSpot"
                                        value={formData.yellowSpot}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.yellowSpot ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.yellowSpot && <p className="text-red-500 text-sm mt-1">{errors.yellowSpot}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700 mt-6">Нитроспориоз (р. Nigrospora)</label>
                                    <input
                                        type="number"
                                        name="nigrosporiosis"
                                        value={formData.nigrosporiosis}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.nigrosporiosis ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.nigrosporiosis && <p className="text-red-500 text-sm mt-1">{errors.nigrosporiosis}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Чернь колоса (рp. Cladosporium)</label>
                                    <input
                                        type="number"
                                        name="blackEar"
                                        value={formData.blackEar}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.blackEar ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.blackEar && <p className="text-red-500 text-sm mt-1">{errors.blackEar}</p>}
                                </div>
                                    <div>
                                        <label className="block mb-1 text-gray-700">Плесневение (p. Mucor)</label>
                                        <input
                                                type="number"
                                                name="mold"
                                                value={formData.mold}
                                                onChange={handleChange}
                                                className={`w-full p-3 border ${errors.mold ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                                min="0"
                                                max="100"
                                                step="0.1"
                                        />
                                        {errors.mold && <p className="text-red-500 text-sm mt-1">{errors.mold}</p>}
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-gray-700">Общая зараженность болезнями, %</label>
                                            <input
                                                type="number"
                                                name="totalDiseaseInfection"
                                                value={formData.totalDiseaseInfection}
                                                onChange={handleChange}
                                                className={`w-full p-3 border ${errors.totalDiseaseInfection ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                                min="0"
                                                max="100"
                                                step="0.1"
                                            />
                                            {errors.totalDiseaseInfection && <p className="text-red-500 text-sm mt-1">{errors.totalDiseaseInfection}</p>}
                                    </div>

                                    {/*{errors.submit && (*/}
                                    {/*    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">*/}
                                    {/*        {errors.submit}*/}
                                    {/*    </div>*/}
                                    {/*)}*/}

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
                                                {formData.passesStandard ? 'Образец соответствует стандарту' : 'Образец не соответствует стандарту'}
                                            </h3>
                                            {!formData.passesStandard && (
                                                <p>{formData.notes}</p>
                                            )}
                                        </div>
                                    )}
                            </div>
                            </div>
                        </form>
                    )}
            </div>
        </div>
    );
};

export default SeedAnalysisForm;