import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import SampleRepository from '../../Repository/SampleRepository';
import CultureRepository from "../../Repository/CultureRepository";

const PotatoAnalysisForm = () => {
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

        // Potato analysis data based on GOST 33996-2016
        dryRotTotal: 0,
        dryRotPhoma: 0,
        dryRotFusarium: 0,
        dryRotAlternaria: 0,
        dryRotPhytophthora: 0,
        wetRot: 0,
        scabTotal: 0,
        commonScab: 0,
        netScab: 0,
        powderyScab: 0,
        wrinkledTubers: 0,
        rhizoctonia: 0,
        ringRot: 0,
        stemNematode: 0,
        rustySpots: 0,
        mechanicalDamage: 0,
        pestDamage: 0,
        suffocationSigns: 0,
        frozenTubers: 0,
        burnedTubers: 0,
        deformedTubers: 0,
        tuberOutgrowths: 0,
        cutCrushedTubers: 0,
        peeledSkinTubers: 0,

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
                    variety: sample.variety || '',
                    batchNumber: sample.batchNumber || '',
                    culture: sample.culture || sample.culture_id || '',
                    reproduction: sample.reproduction_id || sample.reproduction || ''
                }));

                // Fetch norms for this culture if available
                if (sample.culture_id || sample.culture) {
                    fetchCultureNorms(sample.culture_id || sample.culture,
                        sample.reproduction_id || sample.reproduction || 'elite');
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
                            if (foundSample.culture || foundSample.culture_id) {
                                fetchCultureNorms(foundSample.culture || foundSample.culture_id, foundSample.reproduction || foundSample.reproduction_id || 'elite');
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
            // Map UI reproduction values to backend values if needed
            const reproductionMap = {
                'ОС - оригинальная': 'original',
                'ЭС - элитная': 'elite',
                'РС - 1 репродукция': 'first',
                'РСт - 2 репродукция': 'second'
            };

            const reproductionKey = reproductionMap[reproduction] || reproduction;
            const norms = await CultureRepository.getNormsByCulture(cultureName, 'potatoes', reproductionKey);

            if (norms) {
                setValidationCriteria(norms);
            }
        } catch (error) {
            console.error('Error fetching culture norms:', error);
        }
    };

    const [validationCriteria, setValidationCriteria] = useState({
        dryRotTotal: 1,
        dryRotPhoma: 1,
        dryRotFusarium: 1,
        dryRotAlternaria: 1,
        dryRotPhytophthora: 1,
        wetRot: 1,
        scabTotal: 5,
        commonScab: 5,
        netScab: 5,
        powderyScab: 3,
        wrinkledTubers: 1,
        rhizoctonia: 3,
        ringRot: 0,
        stemNematode: 0,
        rustySpots: 5,
        mechanicalDamage: 5,
        pestDamage: 2,
        suffocationSigns: 0,
        frozenTubers: 0,
        burnedTubers: 0,
        deformedTubers: 0,
        tuberOutgrowths: 0,
        cutCrushedTubers: 0,
        peeledSkinTubers: 0
    });
    // useEffect(() => {
    //     if (id || sample) {
    //         if (sample) {
    //             setFormData(prevData => ({
    //                 ...prevData,
    //                 sampleId: sample.id || '',
    //                 sampleCode: sample.sampleCode || '',
    //                 variety: sample.variety || '',
    //                 batchNumber: sample.batchNumber || ''
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
    //                             batchNumber: foundSample.batchNumber || ''
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Convert to number for numeric fields
        const numericFields = [
            'dryRotTotal', 'dryRotPhoma', 'dryRotFusarium', 'dryRotAlternaria', 'dryRotPhytophthora',
            'wetRot', 'scabTotal', 'commonScab', 'netScab', 'powderyScab', 'wrinkledTubers',
            'rhizoctonia', 'ringRot', 'stemNematode', 'rustySpots', 'mechanicalDamage', 'pestDamage',
            'suffocationSigns', 'frozenTubers', 'burnedTubers', 'deformedTubers', 'tuberOutgrowths',
            'cutCrushedTubers', 'peeledSkinTubers'
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

        // Validate numeric fields are between 0 and 100
        const numericFields = [
            'dryRotTotal', 'dryRotPhoma', 'dryRotFusarium', 'dryRotAlternaria', 'dryRotPhytophthora',
            'wetRot', 'scabTotal', 'commonScab', 'netScab', 'powderyScab', 'wrinkledTubers',
            'rhizoctonia', 'ringRot', 'stemNematode', 'rustySpots', 'mechanicalDamage', 'pestDamage'
        ];

        numericFields.forEach(field => {
            const value = formData[field];
            if (value === '' || isNaN(value)) {
                newErrors[field] = 'Поле должно содержать число';
            } else if (value < 0 || value > 100) {
                newErrors[field] = 'Значение должно быть от 0 до 100';
            }
        });

        // Validate that total values match sum of components
        const dryRotSum = (
            parseFloat(formData.dryRotPhoma || 0) +
            parseFloat(formData.dryRotFusarium || 0) +
            parseFloat(formData.dryRotAlternaria || 0) +
            parseFloat(formData.dryRotPhytophthora || 0)
        );

        if (Math.abs(dryRotSum - parseFloat(formData.dryRotTotal || 0)) > 0.01) {
            newErrors.dryRotTotal = 'Сумма компонентов сухой гнили не соответствует общему значению';
        }

        const scabSum = (
            parseFloat(formData.commonScab || 0) +
            parseFloat(formData.netScab || 0) +
            parseFloat(formData.powderyScab || 0) +
            parseFloat(formData.wrinkledTubers || 0)
        );

        if (Math.abs(scabSum - parseFloat(formData.scabTotal || 0)) > 0.01) {
            newErrors.scabTotal = 'Сумма компонентов парши не соответствует общему значению';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const analyzeResults = () => {
        // Analysis based on GOST 33996-2016 standards and culture-specific norms
        let passesStandard = true;
        const notes = [];

        // Check dry rot (using norm from culture)
        if (formData.dryRotTotal > validationCriteria.dryRotTotal) {
            passesStandard = false;
            notes.push(`Превышено допустимое количество клубней, пораженных сухой гнилью (макс. ${validationCriteria.dryRotTotal}%)`);
        }

        // Check wet rot (using norm from culture)
        if (formData.wetRot > validationCriteria.wetRot) {
            passesStandard = false;
            notes.push(`Превышено допустимое количество клубней, пораженных мокрой гнилью (макс. ${validationCriteria.wetRot}%)`);
        }

        // Check common scab (using norm from culture)
        if (formData.commonScab > validationCriteria.commonScab) {
            passesStandard = false;
            notes.push(`Превышено допустимое количество клубней, пораженных обыкновенной паршой (макс. ${validationCriteria.commonScab}%)`);
        }

        // Check net scab (using norm from culture)
        if (formData.netScab > validationCriteria.netScab) {
            passesStandard = false;
            notes.push(`Превышено допустимое количество клубней, пораженных сетчатой паршой (макс. ${validationCriteria.netScab}%)`);
        }

        // Check powdery scab (using norm from culture)
        if (formData.powderyScab > validationCriteria.powderyScab) {
            passesStandard = false;
            notes.push(`Превышено допустимое количество клубней, пораженных порошистой паршой (макс. ${validationCriteria.powderyScab}%)`);
        }

        // Check wrinkled tubers (using norm from culture)
        if (formData.wrinkledTubers > validationCriteria.wrinkledTubers) {
            passesStandard = false;
            notes.push(`Превышено допустимое количество сморщенных клубней (макс. ${validationCriteria.wrinkledTubers}%)`);
        }

        // Check rhizoctonia (using norm from culture)
        if (formData.rhizoctonia > validationCriteria.rhizoctonia) {
            passesStandard = false;
            notes.push(`Превышено допустимое количество клубней, пораженных ризоктониозом (макс. ${validationCriteria.rhizoctonia}%)`);
        }

        // Check ring rot (not allowed)
        if (formData.ringRot > validationCriteria.ringRot) {
            passesStandard = false;
            notes.push('Наличие клубней, пораженных кольцевой гнилью, не допускается');
        }

        // Check stem nematode (not allowed)
        if (formData.stemNematode > validationCriteria.stemNematode) {
            passesStandard = false;
            notes.push('Наличие клубней, пораженных стеблевой нематодой, не допускается');
        }

        // Check rusty spots (using norm from culture)
        if (formData.rustySpots > validationCriteria.rustySpots) {
            passesStandard = false;
            notes.push(`Превышено допустимое количество клубней с железистой пятнистостью (макс. ${validationCriteria.rustySpots}%)`);
        }

        // Check mechanical damage (using norm from culture)
        if (formData.mechanicalDamage > validationCriteria.mechanicalDamage) {
            passesStandard = false;
            notes.push(`Превышено допустимое количество клубней с механическими повреждениями (макс. ${validationCriteria.mechanicalDamage}%)`);
        }

        // Check pest damage (using norm from culture)
        if (formData.pestDamage > validationCriteria.pestDamage) {
            passesStandard = false;
            notes.push(`Превышено допустимое количество клубней с повреждениями вредителями (макс. ${validationCriteria.pestDamage}%)`);
        }

        // Check suffocation signs (not allowed)
        if (formData.suffocationSigns > validationCriteria.suffocationSigns) {
            passesStandard = false;
            notes.push('Наличие клубней с признаками удушья не допускается');
        }

        // Check frozen tubers (not allowed)
        if (formData.frozenTubers > validationCriteria.frozenTubers) {
            passesStandard = false;
            notes.push('Наличие подмороженных клубней не допускается');
        }

        // Check burned tubers (not allowed)
        if (formData.burnedTubers > validationCriteria.burnedTubers) {
            passesStandard = false;
            notes.push('Наличие клубней с ожогами не допускается');
        }

        // Check deformed tubers (not allowed)
        if (formData.deformedTubers > validationCriteria.deformedTubers) {
            passesStandard = false;
            notes.push('Наличие уродливых клубней не допускается');
        }

        // Check tubers with outgrowths (not allowed)
        if (formData.tuberOutgrowths > validationCriteria.tuberOutgrowths) {
            passesStandard = false;
            notes.push('Наличие клубней с израстаниями не допускается');
        }

        // Check cut and crushed tubers (not allowed)
        if (formData.cutCrushedTubers > validationCriteria.cutCrushedTubers) {
            passesStandard = false;
            notes.push('Наличие разрезанных и раздавленных клубней не допускается');
        }

        // Check tubers with peeled skin (not allowed)
        if (formData.peeledSkinTubers > validationCriteria.peeledSkinTubers) {
            passesStandard = false;
            notes.push('Наличие клубней с ободранной кожурой (>1/4 поверхности) не допускается');
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
                const sampleRepo = useSampleRepository();
                await sampleRepo.saveAnalysisResults(updatedFormData);

                // Show success message or navigate
                // alert(
                //     analysisResults.passesStandard
                //         ? 'Образец соответствует стандарту ГОСТ 33996-2016'
                //         : `Образец не соответствует стандарту ГОСТ 33996-2016. Причины: ${analysisResults.notes}`
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
                    Анализ образца картофеля по ГОСТ 33996-2016
                </h2>

                {isLoading ? (
                    <div className="flex justify-center my-8">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
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
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Наличие клубней, пораженных сухой
                                гнилью (% по счету)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                <div>
                                    <label className="block mb-1 text-gray-700 mt-6">Всего</label>
                                    <input
                                        type="number"
                                        name="dryRotTotal"
                                        value={formData.dryRotTotal}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.dryRotTotal ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.dryRotTotal &&
                                        <p className="text-red-500 text-sm mt-1">{errors.dryRotTotal}</p>}

                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700 mt-6">Фомоз (р. Phoma)</label>
                                    <input
                                        type="number"
                                        name="dryRotPhoma"
                                        value={formData.dryRotPhoma}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.dryRotPhoma ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.dryRotPhoma &&
                                        <p className="text-red-500 text-sm mt-1">{errors.dryRotPhoma}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700 mt-6">Фузариоз (p.Fusarium)</label>
                                    <input
                                        type="number"
                                        name="dryRotFusarium"
                                        value={formData.dryRotFusarium}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.dryRotFusarium ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.dryRotFusarium &&
                                        <p className="text-red-500 text-sm mt-1">{errors.dryRotFusarium}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Альтернариоз (Alternaria solani)</label>
                                    <input
                                        type="number"
                                        name="dryRotAlternaria"
                                        value={formData.dryRotAlternaria}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.dryRotAlternaria ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.dryRotAlternaria &&
                                        <p className="text-red-500 text-sm mt-1">{errors.dryRotAlternaria}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Фитофтороз (Phytophthora
                                        infestans)</label>
                                    <input
                                        type="number"
                                        name="dryRotPhytophthora"
                                        value={formData.dryRotPhytophthora}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.dryRotPhytophthora ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.dryRotPhytophthora &&
                                        <p className="text-red-500 text-sm mt-1">{errors.dryRotPhytophthora}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Наличие клубней, пораженных мокрой
                                гнилью (% по счету)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block mb-1 text-gray-700">Всего</label>
                                    <input
                                        type="number"
                                        name="wetRot"
                                        value={formData.wetRot}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.wetRot ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.wetRot && <p className="text-red-500 text-sm mt-1">{errors.wetRot}</p>}

                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Наличие клубней, пораженных паршой (%
                                по счету)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                <div>
                                    <label className="block mb-1 text-gray-700 mt-6">Всего</label>
                                    <input
                                        type="number"
                                        name="scabTotal"
                                        value={formData.scabTotal}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.scabTotal ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.scabTotal &&
                                        <p className="text-red-500 text-sm mt-1">{errors.scabTotal}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Обыкновенная (>33.3%
                                        поверхности)</label>
                                    <input
                                        type="number"
                                        name="commonScab"
                                        value={formData.commonScab}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.commonScab ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.commonScab &&
                                        <p className="text-red-500 text-sm mt-1">{errors.commonScab}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Сетчатая (>33.3% поверхности)</label>
                                    <input
                                        type="number"
                                        name="netScab"
                                        value={formData.netScab}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.netScab ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.netScab && <p className="text-red-500 text-sm mt-1">{errors.netScab}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Порошистая (>33.3% поверхности)</label>
                                    <input
                                        type="number"
                                        name="powderyScab"
                                        value={formData.powderyScab}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.powderyScab ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.powderyScab &&
                                        <p className="text-red-500 text-sm mt-1">{errors.powderyScab}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700 mt-6">Сморщенные клубни</label>
                                    <input
                                        type="number"
                                        name="wrinkledTubers"
                                        value={formData.wrinkledTubers}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.wrinkledTubers ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.wrinkledTubers &&
                                        <p className="text-red-500 text-sm mt-1">{errors.wrinkledTubers}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Другие показатели (% по счету)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block mb-1 text-gray-700">Ризоктониоз (>10% поверхности)</label>
                                    <input
                                        type="number"
                                        name="rhizoctonia"
                                        value={formData.rhizoctonia}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.rhizoctonia ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.rhizoctonia &&
                                        <p className="text-red-500 text-sm mt-1">{errors.rhizoctonia}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Кольцевая гниль</label>
                                    <input
                                        type="number"
                                        name="ringRot"
                                        value={formData.ringRot}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.ringRot ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.ringRot && <p className="text-red-500 text-sm mt-1">{errors.ringRot}</p>}

                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Стеблевая нематода</label>
                                    <input
                                        type="number"
                                        name="stemNematode"
                                        value={formData.stemNematode}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.stemNematode ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.stemNematode &&
                                        <p className="text-red-500 text-sm mt-1">{errors.stemNematode}</p>}

                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Железистая пятнистость (>1/4
                                        разреза)</label>
                                    <input
                                        type="number"
                                        name="rustySpots"
                                        value={formData.rustySpots}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.rustySpots ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.rustySpots &&
                                        <p className="text-red-500 text-sm mt-1">{errors.rustySpots}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Механические повреждения</label>
                                    <input
                                        type="number"
                                        name="mechanicalDamage"
                                        value={formData.mechanicalDamage}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.mechanicalDamage ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.mechanicalDamage &&
                                        <p className="text-red-500 text-sm mt-1">{errors.mechanicalDamage}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Повреждения вредителями</label>
                                    <input
                                        type="number"
                                        name="pestDamage"
                                        value={formData.pestDamage}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.pestDamage ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.pestDamage &&
                                        <p className="text-red-500 text-sm mt-1">{errors.pestDamage}</p>}
                                </div>
                            </div>
                        </div>
                        {/* Add this after the existing "Другие показатели" section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Дополнительные показатели (% по
                                счету)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block mb-1 text-gray-700">Клубни с признаками удушья</label>
                                    <input
                                        type="number"
                                        name="suffocationSigns"
                                        value={formData.suffocationSigns}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.suffocationSigns ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.suffocationSigns &&
                                        <p className="text-red-500 text-sm mt-1">{errors.suffocationSigns}</p>}

                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Подмороженные клубни</label>
                                    <input
                                        type="number"
                                        name="frozenTubers"
                                        value={formData.frozenTubers}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.frozenTubers ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.frozenTubers &&
                                        <p className="text-red-500 text-sm mt-1">{errors.frozenTubers}</p>}

                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Клубни с ожогами</label>
                                    <input
                                        type="number"
                                        name="burnedTubers"
                                        value={formData.burnedTubers}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.burnedTubers ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.burnedTubers &&
                                        <p className="text-red-500 text-sm mt-1">{errors.burnedTubers}</p>}

                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Уродливые клубни</label>
                                    <input
                                        type="number"
                                        name="deformedTubers"
                                        value={formData.deformedTubers}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.deformedTubers ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.deformedTubers &&
                                        <p className="text-red-500 text-sm mt-1">{errors.deformedTubers}</p>}

                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Клубни с израстаниями</label>
                                    <input
                                        type="number"
                                        name="tuberOutgrowths"
                                        value={formData.tuberOutgrowths}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.tuberOutgrowths ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.tuberOutgrowths &&
                                        <p className="text-red-500 text-sm mt-1">{errors.tuberOutgrowths}</p>}

                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Разрезанные и раздавленные
                                        клубни</label>
                                    <input
                                        type="number"
                                        name="cutCrushedTubers"
                                        value={formData.cutCrushedTubers}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.cutCrushedTubers ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.cutCrushedTubers &&
                                        <p className="text-red-500 text-sm mt-1">{errors.cutCrushedTubers}</p>}

                                </div>

                                <div>
                                    <label className="block mb-1 text-gray-700">Клубни с ободранной кожурой (>1/4
                                        поверхности)</label>
                                    <input
                                        type="number"
                                        name="peeledSkinTubers"
                                        value={formData.peeledSkinTubers}
                                        onChange={handleChange}
                                        className={`w-full p-3 border ${errors.peeledSkinTubers ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                    {errors.peeledSkinTubers &&
                                        <p className="text-red-500 text-sm mt-1">{errors.peeledSkinTubers}</p>}

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
                            <div
                                className={`mt-6 p-4 rounded-lg ${formData.passesStandard ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                <h3 className="font-semibold mb-2">
                                    {formData.passesStandard ? 'Образец соответствует стандарту ГОСТ 33996-2016' : 'Образец не соответствует стандарту ГОСТ 33996-2016'}
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

export default PotatoAnalysisForm;