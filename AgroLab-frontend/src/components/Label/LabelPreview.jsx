import React from 'react';
import { useLocation } from 'react-router-dom';
import labelService from '../../services/LabelService';
import { saveAs } from 'file-saver';
import '../../styles/LabelPreview.css';

const LabelPreview = () => {
    const location = useLocation();
    const { formData, sampleId, category } = location.state || {}; // Access formData from state

    if (!formData) {
        return <div>No data available</div>; // Handle case where no data is passed
    }

    const handleDownload = async () => {
        try {
            const response = await labelService.submitLabelWithId(category, sampleId, formData);
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            saveAs(blob, `etiketka_${category}_${sampleId}.docx`);
        } catch (error) {
            console.error("Ошибка при скачивании этикетки", error);
            alert("Не удалось скачать этикетку");
        }
    };

    return (
        <div className="flex flex-col items-center mt-10 space-y-6">
            <div className="label-container">
                <h1 className="label-title">ЭТИКЕТКА</h1>
                <p className="label-subtitle">к средней пробе семян</p>
                <div className="label-header">
                    <div>№___</div>
                    <div>от {new Date().getFullYear()} г.</div>
                </div>
                <div className="label-content">
                    <div className="label-item">
                        <p>1.</p>
                        <p>Культура</p>
                        <span className="field-value">{formData.culture}</span>
                    </div>
                    <hr className="label-divider" />
                    <div className="label-item">
                        <p>2.</p>
                        <p>Сорт</p>
                        <span className="field-value">{formData.variety || formData.sortName}</span>
                    </div>
                    <hr className="label-divider" />
                    <div className="label-item">
                        <p>3.</p>
                        <p>Репродукция</p>
                        <span className="field-value">{formData.reproduction}</span>
                    </div>
                    <hr className="label-divider" />
                    <div className="label-item">
                        <p>4. Год урожая</p>
                        <span className="field-value">{formData.harvestYear}</span>
                    </div>
                    <hr className="label-divider" />
                    <div className="label-item">
                        <p>5. Партия №</p>
                        <span className="field-value">{formData.batchNumber}</span>
                    </div>
                    <hr className="label-divider" />
                    <div className="label-item">
                        <p>6. Масса партии, ц</p>
                        <span className="field-value">{formData.batchWeight}</span>
                    </div>
                    <hr className="label-divider" />
                    <div className="label-item">
                        <p>7. Контрольная единица №</p>
                        <span className="field-value">{formData.controlUnit}</span>
                    </div>
                    <hr className="label-divider" />
                    <div className="label-item">
                        <p>8. Вид анализа</p>
                        <span className="field-value">{formData.analysisType}</span>
                    </div>
                    <hr className="label-divider" />
                </div>
            </div>

            <button
                onClick={handleDownload}
                className="mt-6 w-full max-w-xs bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-lg shadow-md transition duration-200"
            >
                Скачать этикетку
            </button>
        </div>
    );
};

export default LabelPreview;
