import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface AttributeSchemaPreviewProps {
  schema: any;
}

export const AttributeSchemaPreview: React.FC<AttributeSchemaPreviewProps> = ({ schema }) => {
  const [values, setValues] = useState<Record<string, any>>({});

  const updateValue = (key: string, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const isVisible = (attribute: any) => {
    if (!attribute.visible_if) return true;
    
    for (const [key, expectedValues] of Object.entries(attribute.visible_if)) {
      const currentValue = values[key];
      if (!Array.isArray(expectedValues) || !expectedValues.includes(currentValue)) {
        return false;
      }
    }
    return true;
  };

  const renderAttribute = (attribute: any) => {
    if (!isVisible(attribute)) return null;

    const value = values[attribute.key] ?? attribute.default;

    switch (attribute.type) {
      case 'enum':
        return (
          <div key={attribute.key} className="space-y-2">
            <Label>{attribute.label}</Label>
            <Select 
              value={value} 
              onValueChange={(val) => updateValue(attribute.key, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {attribute.values?.map((option: any) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'multienum':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={attribute.key} className="space-y-2">
            <Label>{attribute.label}</Label>
            <div className="flex flex-wrap gap-2">
              {attribute.values?.map((option: any) => {
                const isSelected = selectedValues.includes(option.key);
                return (
                  <Badge
                    key={option.key}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const newValues = isSelected
                        ? selectedValues.filter((v: string) => v !== option.key)
                        : [...selectedValues, option.key];
                      updateValue(attribute.key, newValues);
                    }}
                  >
                    {option.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        );

      case 'bool':
        return (
          <div key={attribute.key} className="flex items-center space-x-2">
            <Switch
              checked={value || false}
              onCheckedChange={(checked) => updateValue(attribute.key, checked)}
            />
            <Label>{attribute.label}</Label>
          </div>
        );

      case 'number':
        return (
          <div key={attribute.key} className="space-y-2">
            <Label>{attribute.label}</Label>
            {attribute.min !== undefined && attribute.max !== undefined ? (
              <div className="space-y-2">
                <Slider
                  value={[value || attribute.min]}
                  onValueChange={([val]) => updateValue(attribute.key, val)}
                  min={attribute.min}
                  max={attribute.max}
                  step={attribute.step || 1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground text-center">
                  {value || attribute.min} {attribute.unit || ''}
                </div>
              </div>
            ) : (
              <Input
                type="number"
                value={value || ''}
                onChange={(e) => updateValue(attribute.key, parseFloat(e.target.value) || 0)}
                min={attribute.min}
                max={attribute.max}
                step={attribute.step || 1}
              />
            )}
          </div>
        );

      case 'text':
        return (
          <div key={attribute.key} className="space-y-2">
            <Label>{attribute.label}</Label>
            <Input
              value={value || ''}
              onChange={(e) => updateValue(attribute.key, e.target.value)}
              placeholder={attribute.placeholder}
            />
          </div>
        );

      default:
        return (
          <div key={attribute.key} className="space-y-2">
            <Label>{attribute.label}</Label>
            <div className="text-sm text-muted-foreground">
              Unsupported type: {attribute.type}
            </div>
          </div>
        );
    }
  };

  if (!schema?.groups) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No attribute groups defined in schema
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        This is a preview of how the attribute form will appear to users
      </div>
      
      {schema.groups.map((group: any) => (
        <Card key={group.key}>
          <CardHeader>
            <CardTitle className="text-lg">{group.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {group.attributes?.map(renderAttribute)}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Values</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-muted p-4 rounded">
            {JSON.stringify(values, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};