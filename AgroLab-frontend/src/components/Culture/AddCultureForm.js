// AddCultureForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CultureRepository from '../../Repository/CultureRepository';

const AddCultureForm = ({ onAdd, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { culture } = location.state || {};

    const [cultureName, setCultureName] = useState('');
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [originalCulture, setOriginalCulture] = useState('');
    const [cultureType, setCultureType] = useState('seeds'); // 'seeds' или 'potatoes'
    const [showNorms, setShowNorms] = useState(false);

    // Нормы для семян по репродукциям
    const [seedNorms, setSeedNorms] = useState({
        original: {
            germinationEnergy: '',
            germination: '',
            seedPurity: '',
            waste: '',
            otherCropSeeds: '',
            oatSeeds: '',
            weedSeeds: '',
            quarantineSeeds: '',
            ergotSclerotia: '',
            wheatNematodeGalls: '',
            smutFormations: '',
            thousandSeedWeight: '',
            alternaria: '',
            fusarium: '',
            helminthosporium: '',
            septoria: '',
            yellowSpot: '',
            nigrosporiosis: '',
            blackEar: '',
            mold: '',
            totalDiseaseInfection: ''
        },
        elite: {
            germinationEnergy: '',
            germination: '',
            seedPurity: '',
            waste: '',
            otherCropSeeds: '',
            oatSeeds: '',
            weedSeeds: '',
            quarantineSeeds: '',
            ergotSclerotia: '',
            wheatNematodeGalls: '',
            smutFormations: '',
            thousandSeedWeight: '',
            alternaria: '',
            fusarium: '',
            helminthosporium: '',
            septoria: '',
            yellowSpot: '',
            nigrosporiosis: '',
            blackEar: '',
            mold: '',
            totalDiseaseInfection: ''
        },
        first: {
            germinationEnergy: '',
            germination: '',
            seedPurity: '',
            waste: '',
            otherCropSeeds: '',
            oatSeeds: '',
            weedSeeds: '',
            quarantineSeeds: '',
            ergotSclerotia: '',
            wheatNematodeGalls: '',
            smutFormations: '',
            thousandSeedWeight: '',
            alternaria: '',
            fusarium: '',
            helminthosporium: '',
            septoria: '',
            yellowSpot: '',
            nigrosporiosis: '',
            blackEar: '',
            mold: '',
            totalDiseaseInfection: ''
        },
        second: {
            germinationEnergy: '',
            germination: '',
            seedPurity: '',
            waste: '',
            otherCropSeeds: '',
            oatSeeds: '',
            weedSeeds: '',
            quarantineSeeds: '',
            ergotSclerotia: '',
            wheatNematodeGalls: '',
            smutFormations: '',
            thousandSeedWeight: '',
            alternaria: '',
            fusarium: '',
            helminthosporium: '',
            septoria: '',
            yellowSpot: '',
            nigrosporiosis: '',
            blackEar: '',
            mold: '',
            totalDiseaseInfection: ''
        }
    });

    // Нормы для картофеля по репродукциям
    const [potatoNorms, setPotatoNorms] = useState({
        original: {
            dryRotTotal: '',
            dryRotPhoma: '',
            dryRotFusarium: '',
            dryRotAlternaria: '',
            dryRotPhytophthora: '',
            wetRot: '',
            scabTotal: '',
            commonScab: '',
            netScab: '',
            powderyScab: '',
            wrinkledTubers: '',
            rhizoctonia: '',
            ringRot: '',
            stemNematode: '',
            rustySpots: '',
            mechanicalDamage: '',
            pestDamage: '',
            suffocationSigns: '',
            frozenTubers: '',
            burnedTubers: '',
            deformedTubers: '',
            tuberOutgrowths: '',
            cutCrushedTubers: '',
            peeledSkinTubers: ''
        },
        elite: {
            dryRotTotal: '',
            dryRotPhoma: '',
            dryRotFusarium: '',
            dryRotAlternaria: '',
            dryRotPhytophthora: '',
            wetRot: '',
            scabTotal: '',
            commonScab: '',
            netScab: '',
            powderyScab: '',
            wrinkledTubers: '',
            rhizoctonia: '',
            ringRot: '',
            stemNematode: '',
            rustySpots: '',
            mechanicalDamage: '',
            pestDamage: '',
            suffocationSigns: '',
            frozenTubers: '',
            burnedTubers: '',
            deformedTubers: '',
            tuberOutgrowths: '',
            cutCrushedTubers: '',
            peeledSkinTubers: ''
        },
        first: {
            dryRotTotal: '',
            dryRotPhoma: '',
            dryRotFusarium: '',
            dryRotAlternaria: '',
            dryRotPhytophthora: '',
            wetRot: '',
            scabTotal: '',
            commonScab: '',
            netScab: '',
            powderyScab: '',
            wrinkledTubers: '',
            rhizoctonia: '',
            ringRot: '',
            stemNematode: '',
            rustySpots: '',
            mechanicalDamage: '',
            pestDamage: '',
            suffocationSigns: '',
            frozenTubers: '',
            burnedTubers: '',
            deformedTubers: '',
            tuberOutgrowths: '',
            cutCrushedTubers: '',
            peeledSkinTubers: ''
        },
        second: {
            dryRotTotal: '',
            dryRotPhoma: '',
            dryRotFusarium: '',
            dryRotAlternaria: '',
            dryRotPhytophthora: '',
            wetRot: '',
            scabTotal: '',
            commonScab: '',
            netScab: '',
            powderyScab: '',
            wrinkledTubers: '',
            rhizoctonia: '',
            ringRot: '',
            stemNematode: '',
            rustySpots: '',
            mechanicalDamage: '',
            pestDamage: '',
            suffocationSigns: '',
            frozenTubers: '',
            burnedTubers: '',
            deformedTubers: '',
            tuberOutgrowths: '',
            cutCrushedTubers: '',
            peeledSkinTubers: ''
        }
    });

    useEffect(() => {
        if (culture) {
            // Если это объект с полной информацией о культуре
            if (typeof culture === 'object') {
                setCultureName(culture.name || culture);
                setCultureType(culture.type || 'seeds');
                setSeedNorms(culture.seedNorms || seedNorms);
                setPotatoNorms(culture.potatoNorms || potatoNorms);
                setShowNorms(true);
            } else {
                // Если это просто строка с названием культуры
                setCultureName(culture);
            }
            setIsEditMode(true);
            setOriginalCulture(culture);
        }
    }, [culture]);

    const validateForm = () => {
        if (!cultureName.trim()) {
            setError('Название культуры обязательно');
            return false;
        }
        setError('');
        return true;
    };

    const handleSave = async () => {
        if (validateForm()) {
            try {
                const cultureData = {
                    name: cultureName,
                    type: cultureType,
                    seedNorms: cultureType === 'seeds' ? seedNorms : undefined,
                    potatoNorms: cultureType === 'potatoes' ? potatoNorms : undefined
                };

                if (isEditMode) {
                    // Update existing culture
                    await CultureRepository.updateCulture(originalCulture.id, cultureData);

                } else {
                    // Add new culture
                    await CultureRepository.createCulture(cultureData);
                }
                setCultureName('');
                navigate('/culture-table');
            } catch (error) {
                setError('Произошла ошибка при сохранении культуры');
            }
        }
    };

    const handleSeedNormChange = (reproduction, field, value) => {
        setSeedNorms(prev => ({
            ...prev,
            [reproduction]: {
                ...prev[reproduction],
                [field]: value
            }
        }));
    };

    const handlePotatoNormChange = (reproduction, field, value) => {
        setPotatoNorms(prev => ({
            ...prev,
            [reproduction]: {
                ...prev[reproduction],
                [field]: value
            }
        }));
    };

    // Названия полей для отображения
    const seedFieldLabels = {
        germinationEnergy: 'Энергия прорастания, %',
        germination: 'Всхожесть, %',
        seedPurity: 'Чистота семян, %',
        waste: 'Отход, %',
        otherCropSeeds: 'Семена других культурных растений, всего (шт/кг)',
        oatSeeds: 'Овес (шт/кг)',
        weedSeeds: 'Семян сорных растений, всего (шт/кг)',
        quarantineSeeds: 'Семян карантинных растений (шт/кг)',
        ergotSclerotia: 'Склероции спорыньи, %',
        wheatNematodeGalls: 'Галлы пшеничной нематоды (шт/кг)',
        smutFormations: 'Головневые образования, %',
        thousandSeedWeight: 'Масса 1000 семян, г',
        alternaria: 'Альтернариоз (р. Alternaria), %',
        fusarium: 'Фузариоз (p. Fusarium), %',
        helminthosporium: 'Гельминтоспориоз (Сochliobolus sativus), %',
        septoria: 'Септориоз (р. Septoria), %',
        yellowSpot: 'Желтая пятнистость, пиренофороз (Pyrenophora tritici-repentis), %',
        nigrosporiosis: 'Нигроспориоз (р.Nigrospora), %',
        blackEar: 'Чернь колоса (p. Cladosporium), %',
        mold: 'Плесневение (p. Mucor), %',
        totalDiseaseInfection: 'Общая зараженность болезнями, %'
    };

    const potatoFieldLabels = {
        dryRotTotal: 'Наличие клубней, пораженных сухой гнилью (всего), %',
        dryRotPhoma: 'Фомоз (р.Phoma), %',
        dryRotFusarium: 'Сухая фузариозная гниль (р.Fusarium), %',
        dryRotAlternaria: 'Альтернариоз (Alternaria solani), %',
        dryRotPhytophthora: 'Фитофтороз (Phytophthora infestans), %',
        wetRot: 'Наличие клубней, пораженных мокрой гнилью, %',
        scabTotal: 'Наличие клубней, пораженных паршой (р.Streptomyces), всего, %',
        commonScab: 'Обыкновенная парша (поражено более 33,3% поверхности клубня), %',
        netScab: 'Сетчатая парша (поражение более 33,3% поверхности клубня), %',
        powderyScab: 'Порошистая парша (поражение более 33,3% поверхности клубня), %',
        wrinkledTubers: 'Сморщенные клубни, в т.ч. вследствие парши серебристой, %',
        rhizoctonia: 'Наличие клубней, пораженных ризоктониозом (при поражении более 10% поверхности клубня), %',
        ringRot: 'Пораженных кольцевой гнилью, %',
        stemNematode: 'Пораженных стеблевой нематодой, %',
        rustySpots: 'С железистой пятнистостью и потемнением мякоти, %',
        mechanicalDamage: 'С механическими повреждениями глубиной более 5 мм и длиной более 10 мм, %',
        pestDamage: 'С повреждениями сельскохозяйственными вредителями без повреждения глазков, %',
        suffocationSigns: 'С признаками удушья, %',
        frozenTubers: 'Подмороженных, %',
        burnedTubers: 'С ожогами, %',
        deformedTubers: 'Уродливых, %',
        tuberOutgrowths: 'С израстаниями и легко обламывающимися наростами, %',
        cutCrushedTubers: 'Разрезанных и раздавленных, %',
        peeledSkinTubers: 'С ободранной кожурой (более ¼ поверхности клубня), %'
    };

    const renderSeedNormsForm = () => {
        return (
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Нормы для семян</h3>

                <div className="grid grid-cols-5 gap-4 mb-4">
                    <div className="font-semibold">Параметр</div>
                    <div className="font-semibold">ОС - оригинальная</div>
                    <div className="font-semibold">ЭС - элитная</div>
                    <div className="font-semibold">РС - 1 репродукция</div>
                    <div className="font-semibold">РСт - 2 репродукция</div>
                </div>

                {Object.keys(seedFieldLabels).map(field => (
                    <div key={field} className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-4 mb-2">
                        <div className="py-2">{seedFieldLabels[field]}</div>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            className="p-2 border border-gray-300 rounded-lg"
                            value={seedNorms.original[field]}
                            onChange={(e) => handleSeedNormChange('original', field, e.target.value)}
                        />
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            className="p-2 border border-gray-300 rounded-lg"
                            value={seedNorms.elite[field]}
                            onChange={(e) => handleSeedNormChange('elite', field, e.target.value)}
                        />
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            className="p-2 border border-gray-300 rounded-lg"
                            value={seedNorms.first[field]}
                            onChange={(e) => handleSeedNormChange('first', field, e.target.value)}
                        />
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            className="p-2 border border-gray-300 rounded-lg"
                            value={seedNorms.second[field]}
                            onChange={(e) => handleSeedNormChange('second', field, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        );
    };

    const renderPotatoNormsForm = () => {
        return (
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Нормы для картофеля</h3>

                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="font-semibold">Параметр</div>
                    <div className="font-semibold">ОС - оригинальная</div>
                    <div className="font-semibold">ЭС - элитная</div>
                    <div className="font-semibold">РС - 1 репродукция</div>
                    <div className="font-semibold">РСт - 2 репродукция</div>
                </div>

                {Object.keys(potatoFieldLabels).map(field => (
                    <div key={field} className="grid grid-cols-4 gap-4 mb-2">
                        <div className="py-2">{potatoFieldLabels[field]}</div>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            className="p-2 border border-gray-300 rounded-lg"
                            value={potatoNorms.original[field]}
                            onChange={(e) => handlePotatoNormChange('elite', field, e.target.value)}
                        />
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            className="p-2 border border-gray-300 rounded-lg"
                            value={potatoNorms.elite[field]}
                            onChange={(e) => handlePotatoNormChange('first', field, e.target.value)}
                        />
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            className="p-2 border border-gray-300 rounded-lg"
                            value={potatoNorms.first[field]}
                            onChange={(e) => handlePotatoNormChange('second', field, e.target.value)}
                        />
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            className="p-2 border border-gray-300 rounded-lg"
                            value={potatoNorms.second[field]}
                            onChange={(e) => handlePotatoNormChange('second', field, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white mt-20 p-8 rounded-lg shadow-md max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-700 text-lg font-semibold">
                    {isEditMode ? 'Редактирование культуры' : 'Добавление новой культуры'}
                </h2>
            </div>

            <div className="mb-4">
                <label className="block mb-1 text-gray-700">Наименование</label>
                <input
                    className={`w-full p-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded`}
                    placeholder="Введите название культуры"
                    type="text"
                    value={cultureName}
                    onChange={(e) => {
                        setCultureName(e.target.value);
                        if (error) setError('');
                    }}
                    required
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div className="mb-4">
                <label className="block mb-1 text-gray-700">Тип культуры</label>
                <select
                    className="w-full p-3 border border-gray-300 rounded"
                    value={cultureType}
                    onChange={(e) => setCultureType(e.target.value)}
                >
                    <option value="seeds">Семена</option>
                    <option value="potatoes">Картофель</option>
                    <option value="plants">Растения</option>
                    <option value="soil">Почва</option>
                </select>
            </div>

            <div className="mb-4">
                <button
                    type="button"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded"
                    onClick={() => setShowNorms(!showNorms)}
                >
                    {showNorms ? 'Скрыть нормы' : 'Показать нормы'}
                </button>
            </div>

            {showNorms && (
                <div>
                    {cultureType === 'seeds' && renderSeedNormsForm()}
                    {cultureType === 'potatoes' && renderPotatoNormsForm()}
                    {(cultureType === 'plants' || cultureType === 'soil') && (
                        <div className="mt-4 p-4 bg-yellow-100 rounded">
                            <p>Для данного типа культуры нормы не требуются.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between mt-6">
                <button
                    className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded shadow"
                    onClick={() => navigate('/culture-table')}
                >
                    Отмена
                </button>

                <button
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded shadow"
                    onClick={handleSave}
                >
                    {isEditMode ? 'Сохранить изменения' : 'Сохранить'}
                </button>
            </div>
        </div>
    );
};

export default AddCultureForm;