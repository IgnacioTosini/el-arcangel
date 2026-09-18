'use client';

import { useId } from 'react';

import { type CatalogFiltersValue, sortOptions } from './filterUtils';

import './_catalogFilters.scss';

type CatalogFiltersProps = {
    categories: { value: string; label: string }[];
    value: CatalogFiltersValue;
    onChange: (value: CatalogFiltersValue) => void;
};

export default function CatalogFilters({ value, onChange, categories: catalogCategories }: CatalogFiltersProps) {
    const id = useId();
    return (
        <div className="catalogFiltersContent">
            <fieldset className="catalogFiltersCategories">
                <legend>Categorías</legend>
                <div className="catalogFiltersOptions">
                    {catalogCategories.map((category) => (
                        <label className="catalogFiltersCategory" key={category.value}>
                            <input type="radio" name={`${id}-category`} value={category.value} checked={value.category === category.value} onChange={() => onChange({ ...value, category: category.value })} />
                            <span>{category.label}</span>
                        </label>
                    ))}
                </div>
            </fieldset>
            <fieldset className="catalogFiltersSort">
                <legend>Ordenar por:</legend>
                <div className="catalogFiltersOptions">
                    {sortOptions.map((option) => (
                        <label className="catalogFiltersOrder" key={option.value}>
                            <input type="radio" name={`${id}-sort`} value={option.value} checked={value.sort === option.value} onChange={() => onChange({ ...value, sort: option.value })} />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </fieldset>
        </div>
    );
}

