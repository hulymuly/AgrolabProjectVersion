// src/utils/excelExport.js

import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName = 'export', includeRelated = false) => {
    // Define column translations (English to Russian)
    const columnTranslations = {
        // Common fields
        name: 'Название',
        date: 'Дата',
        batch: 'Партия',
        supplier: 'Поставщик',
        expiryDate: 'Срок годности',
        stock: 'Остаток',

        // Customer fields
        email: 'Эл. почта',
        address: 'Адрес',
        inn: 'ИНН',

        // Equipment fields
        category: 'Категория',
        model: 'Модель',
        inventoryNumber: 'Инвентарный номер',
        factoryNumber: 'Заводской номер',
        dateOfCommissioning: 'Дата ввода в эксплуатацию',
        certificateNumber: 'Номер сертификата',
        inspectionDate: 'Дата проверки',
        validUntilDate: 'Годен до',
        width: 'Ширина',
        length: 'Длина',
        height: 'Высота',
        depth: 'Глубина',
        dateOfDecommissioning: 'Дата вывода из эксплуатации',

        // Sample fields
        test_object_name: 'Название объекта',
        sample_code: 'Код образца',
        test_duration: 'Срок испытания',
        harvest_year: 'Год урожая',
        seed_category: 'Категория семян',
        batch_number: 'Номер партии',
        batch_weight: 'Масса партии',
        storage_location: 'Место хранения',
        research_direction: 'Направление исследования',
        culture_id: 'Культура',
        customer: 'Заказчик',
        inn_kpp: 'ИНН/КПП',
        reproduction_id: 'Репродукция',

        // Order fields
        innKpp: 'ИНН/КПП',
        applicationNumber: 'Заявка на испытание',
        contractNumber: 'Договор',
        specificationNumber: 'Спецификация',
        sampleArrivalDate: 'Дата поступления образца',
        testingPeriod: 'Срок проведения испытания',
        culture: 'Культура',
        sort: 'Сорт',
        sampleCode: 'Код образца',
        sampleCollector: 'Отбор образцов провел',

        // Analysis fields - Seeds
        germinationEnergy: 'Энергия прорастания, %',
        germination: 'Всхожесть, %',
        seedPurity: 'Чистота семян, %',
        waste: 'Отход, %',
        otherCropSeeds: 'Семена других культурных растений, шт/кг',
        weedSeeds: 'Семена сорных растений, шт/кг',
        quarantineSeeds: 'Семена карантинных растений, шт/кг',

        // Analysis fields - Potatoes
        dryRotTotal: 'Сухая гниль (всего), %',
        wetRot: 'Мокрая гниль, %',
        scabTotal: 'Парша (всего), %',
        rhizoctonia: 'Ризоктониоз, %',

        // Analysis fields - Soil
        pHLevel: 'pH почвы',
        organicMatter: 'Органическое вещество, %',
        mobilePhosphorus: 'Подвижный фосфор, мг/кг',
        mobilePotassium: 'Подвижный калий, мг/кг',

        // Analysis results
        passesStandard: 'Соответствует стандарту',
        notes: 'Примечания',

        harvestYear: 'Год урожая',
        reproduction: 'Репродукция',
        seedCategory: 'Категория семян',
        sampleWeight: 'Масса образца',
        batchNumber: 'Номер партии',
        batchWeight: 'Масса партии',
        storageLocation: 'Место хранения',
        source: 'Источник',
        seedPurpose: 'Назначение семян',
        processingType: 'Тип обработки',
        seedTreatment: 'Обработка семян',
        analysisType: 'Тип анализа',
        protocol: 'Протокол',

        direction: 'Направление',
        applicationForTesting: 'Заявка на испытание',
        certificateNumberAndDate: 'Номер и дата сертификата',
        sampleTask: 'Задача образца',
        testConditions: 'Условия испытания',
        sampleStoragePeriod: 'Срок хранения образца',
        sampleTakenBy: 'Получил образец',
        selectionAct: 'Акт отбора',
        variety: 'Тип',
        sample_selection: 'Отбор образца',
        sampling_act: 'Акт отбора',
        sampling_nd: 'НД на отбор',
        sampling_plan: 'План отбора',
        additional_info: 'Дополнительная информация',
        tuber_count: 'Количество клубней',
        results_distribution: 'Распределение результатов',
        sample_storage_period: 'Срок хранения образца',
        test_basis: 'Основание испытания',
        contract_number: 'Номер договора',
        sample_receipt_date: 'Дата поступления образца',
        test_conditions: 'Условия испытания',
        upload_date: 'Дата загрузки',
        acceptance_file: 'Файл приемки',

        contract_date: 'Дата договора',
        org_and_legal_form: 'Организационно-правовая форма',
    };

    // Process data to remove ID field and translate column headers
    const processedData = data.map(item => {
        const newItem = {...item};

        // Remove ID field
        if ('id' in newItem) {
            delete newItem.id;
        }

        if ('passesStandard' in newItem) {
            newItem.passesStandard = newItem.passesStandard ? 'Да' : 'Нет';
        }

        return newItem;
    });

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(processedData);

    // Translate column headers
    if (worksheet['!ref']) {
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_col(C) + "1"; // Get the cell address of the header
            if (!worksheet[address]) continue;

            const englishHeader = worksheet[address].v;
            if (columnTranslations[englishHeader]) {
                worksheet[address].v = columnTranslations[englishHeader];
            }
        }
    }

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Данные');

    // If there's related data and includeRelated is true
    if (includeRelated && data.length > 0 && data[0].relatedData) {
        // Process related data to remove ID field
        const relatedData = data
            .map(item => item.relatedData)
            .filter(Boolean)
            .map(item => {
                const newItem = {...item};

                // Remove ID field
                if ('id' in newItem) {
                    delete newItem.id;
                }

                return newItem;
            });

        const relatedWorksheet = XLSX.utils.json_to_sheet(relatedData);

        // Translate column headers for related data
        if (relatedWorksheet['!ref']) {
            const range = XLSX.utils.decode_range(relatedWorksheet['!ref']);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_col(C) + "1";
                if (!relatedWorksheet[address]) continue;

                const englishHeader = relatedWorksheet[address].v;
                if (columnTranslations[englishHeader]) {
                    relatedWorksheet[address].v = columnTranslations[englishHeader];
                }
            }
        }

        XLSX.utils.book_append_sheet(workbook, relatedWorksheet, 'Связанные данные');
    }

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};