package com.sentinel.common.persistence;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.postgresql.util.PGobject;

@Converter
public class JsonbStringConverter implements AttributeConverter<String, PGobject> {

    @Override
    public PGobject convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }

        try {
            PGobject jsonObject = new PGobject();
            jsonObject.setType("jsonb");
            jsonObject.setValue(attribute);
            return jsonObject;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to convert JSON string to PostgreSQL jsonb", e);
        }
    }

    @Override
    public String convertToEntityAttribute(PGobject dbData) {
        return dbData == null ? null : dbData.getValue();
    }
}