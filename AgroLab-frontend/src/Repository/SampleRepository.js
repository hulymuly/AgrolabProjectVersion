import SampleService from '../services/SampleService';
import { useEffect, useState } from 'react';

const useSampleRepository = () => {
    const [sampleList, setSampleList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Получение списка образцов при монтировании
    useEffect(() => {
        fetchAllSamples();
    }, []);

    const fetchAllSamples = async () => {
        try {
            setLoading(true);
            const samples = await SampleService.getSampleList();
            setSampleList(samples);
        } catch (err) {
            console.error('Ошибка при загрузке образцов:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addSample = async (newSample) => {
        try {
            const createdId = await SampleService.addSample(newSample);
            // Полностью перезапрашиваем список, чтобы гарантированно получить объект по ID
            await fetchAllSamples();
            return createdId;
        } catch (error) {
            console.error('Ошибка при добавлении образца:', error);
            throw error;
        }
    };

    const updateSample = async (id, updatedSample) => {
        try {
            const updated = await SampleService.updateSample(id, updatedSample);
            setSampleList((prevList) =>
                prevList.map((sample) =>
                    sample.id === id ? updated : sample
                )
            );
            return updated;
        } catch (error) {
            console.error('Ошибка при обновлении образца:', error);
            throw error;
        }
    };

    const deleteSample = async (id) => {
        try {
            const target = sampleList.find(sample => sample.id === id);
            if (!target || !target.category) {
                throw new Error('Категория для удаления не найдена');
            }

            await SampleService.deleteSample(id, target.category);
            setSampleList(prevList => prevList.filter(sample => sample.id !== id));
            return true;
        } catch (error) {
            console.error('Ошибка при удалении образца:', error);
            throw error;
        }
    };

    const uploadSampleFile = async (formData) => {
        try {
            return await SampleService.uploadSampleFile(formData);
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            throw error;
        }
    };

    const saveAnalysisResults = async (analysisData) => {
        try {
            const result = await SampleService.saveAnalysisResults(analysisData);
            if (analysisData.sampleId) {
                setSampleList(prevList =>
                    prevList.map(sample =>
                        sample.id === analysisData.sampleId
                            ? { ...sample, analyses: result }
                            : sample
                    )
                );
            }
            return result;
        } catch (error) {
            console.error('Ошибка при сохранении анализа:', error);
            throw error;
        }
    };

    const generateProtocol = async (sampleId, category) => {
        if (!category) {
            throw new Error('Категория обязательна для генерации протокола');
        }

        try {
            return await SampleService.generateProtocol(sampleId, category);
        } catch (error) {
            console.error('Ошибка при генерации протокола:', error);
            throw error;
        }
    };

    return {
        sampleList,
        loading,
        error,
        addSample,
        updateSample,
        deleteSample,
        uploadSampleFile,
        saveAnalysisResults,
        generateProtocol,
        fetchAllSamples
    };
};

export default useSampleRepository;
