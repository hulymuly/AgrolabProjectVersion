import React, { useState } from 'react';
import LabelForm from './LabelForm';
import LabelPreview from './LabelPreview';

const LabelPage = () => {
    const [formData, setFormData] = useState(null);

    const handleSubmit = (data) => {
        setFormData(data);
    };

    return (
        <div className="mx-auto p-4">
            <LabelForm onSubmit={handleSubmit} />
            {formData && <LabelPreview data={formData} />}
        </div>
    );
};

export default LabelPage;