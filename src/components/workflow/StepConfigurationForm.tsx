import React from 'react';
import type { 
  WorkflowTrigger, 
  WorkflowAction, 
  FieldDefinition, 
  FieldType,
  Condition,
  ConditionGroup,
  ComparisonOperator,
  LogicalOperator
} from '../../types/workflow';

interface StepConfigurationFormProps {
  type: 'trigger' | 'action' | 'condition';
  schema?: Record<string, any>;
  config: Record<string, any>;
  onConfigChange: (config: Record<string, any>) => void;
  availableFields?: Record<string, FieldDefinition>;
  variables?: Record<string, any>;
}

const StepConfigurationForm: React.FC<StepConfigurationFormProps> = ({
  type,
  schema,
  config,
  onConfigChange,
  availableFields,
  variables
}) => {
  if (!schema) {
    return (
      <div className="text-sm text-muted-foreground">
        Select a {type} to configure its settings
      </div>
    );
  }

  const renderDynamicField = (
    field: FieldDefinition,
    value: any,
    onChange: (value: any) => void
  ) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <select
            multiple
            value={value || []}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions).map(
                (option) => option.value
              );
              onChange(selectedOptions);
            }}
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 border rounded bg-background focus:ring-2 focus:ring-primary/20"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            min={field.validation?.min}
            max={field.validation?.max}
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        );

      // Add more field types as needed

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        );
    }
  };

  const renderConditionGroup = (
    group: ConditionGroup,
    path: string,
    onGroupChange: (group: ConditionGroup) => void
  ) => {
    return (
      <div className="space-y-4 pl-4 border-l-2 border-border">
        <select
          value={group.operator}
          onChange={(e) => {
            const newGroup = { ...group, operator: e.target.value as LogicalOperator };
            onGroupChange(newGroup);
          }}
          className="w-32 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="and">AND</option>
          <option value="or">OR</option>
        </select>

        {group.conditions.map((condition, index) => (
          <div key={index} className="space-y-2">
            {'operator' in condition ? (
              renderConditionGroup(
                condition,
                `${path}.conditions.${index}`,
                (newGroup) => {
                  const newConditions = [...group.conditions];
                  newConditions[index] = newGroup;
                  onGroupChange({ ...group, conditions: newConditions });
                }
              )
            ) : (
              renderCondition(
                condition,
                `${path}.conditions.${index}`,
                (newCondition) => {
                  const newConditions = [...group.conditions];
                  newConditions[index] = newCondition;
                  onGroupChange({ ...group, conditions: newConditions });
                }
              )
            )}
          </div>
        ))}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const newCondition: Condition = {
                field: '',
                operator: 'equals',
                value: ''
              };
              onGroupChange({
                ...group,
                conditions: [...group.conditions, newCondition]
              });
            }}
            className="text-sm text-primary hover:text-primary/80"
          >
            Add Condition
          </button>
          <button
            type="button"
            onClick={() => {
              const newGroup: ConditionGroup = {
                operator: 'and',
                conditions: []
              };
              onGroupChange({
                ...group,
                conditions: [...group.conditions, newGroup]
              });
            }}
            className="text-sm text-primary hover:text-primary/80"
          >
            Add Group
          </button>
        </div>
      </div>
    );
  };

  const renderCondition = (
    condition: Condition,
    path: string,
    onChange: (condition: Condition) => void
  ) => {
    return (
      <div className="flex gap-2 items-start">
        <select
          value={condition.field}
          onChange={(e) => onChange({ ...condition, field: e.target.value })}
          className="w-48 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select Field</option>
          {availableFields && Object.entries(availableFields).map(([key, field]) => (
            <option key={key} value={key}>
              {field.label}
            </option>
          ))}
        </select>

        <select
          value={condition.operator}
          onChange={(e) => onChange({ ...condition, operator: e.target.value as ComparisonOperator })}
          className="w-40 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="equals">Equals</option>
          <option value="not_equals">Not Equals</option>
          <option value="greater_than">Greater Than</option>
          <option value="less_than">Less Than</option>
          <option value="contains">Contains</option>
          <option value="not_contains">Not Contains</option>
          <option value="starts_with">Starts With</option>
          <option value="ends_with">Ends With</option>
          <option value="is_empty">Is Empty</option>
          <option value="is_not_empty">Is Not Empty</option>
          <option value="in">In</option>
          <option value="not_in">Not In</option>
        </select>

        {condition.field && availableFields?.[condition.field] && (
          renderDynamicField(
            availableFields[condition.field],
            condition.value,
            (value) => onChange({ ...condition, value })
          )
        )}
      </div>
    );
  };

  const renderField = (
    key: string,
    fieldSchema: Record<string, any>,
    path: string = ''
  ) => {
    const fullPath = path ? `${path}.${key}` : key;
    const value = path ? config[path]?.[key] : config[key];

    if (fieldSchema.type === 'object' && fieldSchema.properties) {
      return (
        <div className="space-y-4 pl-4 border-l-2 border-border">
          {Object.entries(fieldSchema.properties).map(([propKey, propSchema]) => (
            <div key={propKey}>
              <label className="block text-sm font-medium text-foreground mb-1">
                {propKey}
                {schema.required?.includes(propKey) && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </label>
              {renderField(propKey, propSchema as Record<string, any>, fullPath)}
            </div>
          ))}
        </div>
      );
    }

    // Handle dynamic fields
    if (fieldSchema.type === 'field' && availableFields) {
      return renderDynamicField(
        availableFields[key],
        value,
        (newValue) => handleFieldChange(fullPath, newValue)
      );
    }

    // Handle condition groups
    if (fieldSchema.type === 'condition_group') {
      return renderConditionGroup(
        value || { operator: 'and', conditions: [] },
        fullPath,
        (newGroup) => handleFieldChange(fullPath, newGroup)
      );
    }

    return renderDynamicField(
      fieldSchema as FieldDefinition,
      value,
      (newValue) => handleFieldChange(fullPath, newValue)
    );
  };

  const handleFieldChange = (path: string, value: any) => {
    const newConfig = { ...config };
    const pathParts = path.split('.');
    let current = newConfig;

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    current[pathParts[pathParts.length - 1]] = value;
    onConfigChange(newConfig);
  };

  return (
    <div className="space-y-4">
      {Object.entries(schema.properties || {}).map(([key, fieldSchema]) => (
        <div key={key}>
          <label className="block text-sm font-medium text-foreground mb-1">
            {key}
            {schema.required?.includes(key) && (
              <span className="text-destructive ml-1">*</span>
            )}
          </label>
          {renderField(key, fieldSchema as Record<string, any>)}
        </div>
      ))}
    </div>
  );
};

export default StepConfigurationForm;
