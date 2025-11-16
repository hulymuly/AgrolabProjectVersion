import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

const LabelForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { sample, sampleId, category } = location.state || {};

    const getInitialFormData = (sample) => ({
        culture: sample?.culture || sample?.culture_id || '',
        variety: sample?.variety || sample?.test_object_name || '',
        reproduction: sample?.reproduction || sample?.reproduction_id || sample?.seed_category || '',
        harvestYear: sample?.harvestYear || sample?.harvest_year || '',
        batchNumber: sample?.batchNumber || sample?.batch_number || '',
        batchWeight: sample?.batchWeight || sample?.batch_weight || '',
        controlUnit: '', // ручной ввод
        analysisType: sample?.analysisType || sample?.research_direction || '',
    });

    const [formData, setFormData] = useState(getInitialFormData(sample));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/label-preview', {
            state: {
                formData,
                sampleId,
                category
            }
        });
    };

    const handleCancel = () => {
        navigate('/samples');
    };

    return (
        <div className="flex justify-center mt-20">
            <div className="bg-white p-4 rounded-md shadow-lg relative max-w-md w-full">
                <button
                    onClick={handleCancel}
                    className="absolute top-4 right-4 text-white bg-orange-500 rounded-md w-8 h-8 flex items-center justify-center"
                >
                    <i className="fas fa-times"></i>
                </button>

                <h2 className="text-xl font-semibold mb-6 text-gray-700">Создание этикетки</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-600 mb-2">Культура</label>
                        <input
                            type="text"
                            name="culture"
                            value={formData.culture}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-2">Сорт</label>
                        <input
                            type="text"
                            name="variety"
                            value={formData.variety}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-2">Репродукция</label>
                        <input
                            type="text"
                            name="reproduction"
                            value={formData.reproduction}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-2">Год урожая</label>
                        <input
                            type="text"
                            name="harvestYear"
                            value={formData.harvestYear}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-2">Партия №</label>
                        <input
                            type="text"
                            name="batchNumber"
                            value={formData.batchNumber}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-2">Вид анализа</label>
                        <input
                            type="text"
                            name="analysisType"
                            value={formData.analysisType}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-2">Контрольная единица</label>
                        <input
                            type="text"
                            name="controlUnit"
                            value={formData.controlUnit}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-2">Масса партии, ц</label>
                        <input
                            type="text"
                            name="batchWeight"
                            value={formData.batchWeight}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </form>

                <button
                    onClick={handleSubmit}
                    className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg"
                >
                    Создать этикетку
                </button>
            </div>
        </div>
    );
};

export default LabelForm;
