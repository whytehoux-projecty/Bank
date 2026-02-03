# Component Library Guide

This document provides usage instructions for the reusable EJS partials created for the Admin Interface.

## 1. Modal Dialog (`partials/modal.ejs`)

A standard modal wrapper using Alpine.js and Tailwind CSS.

### Usage

```ejs
<%- include('partials/modal', {
    showVar: 'showModal',           // Alpine variable controlling visibility
    closeFunc: 'closeModal()',      // Alpine function to close the modal
    titleExpr: "'Edit User'",       // Alpine expression or string for title
    maxWidth: 'max-w-2xl',          // Optional: CSS class for width (default: max-w-xl)
    
    // HTML Content for Body
    body: `
        <div>
            <label class="form-label">Name</label>
            <input type="text" x-model="formData.name" class="form-input">
        </div>
    `,
    
    // HTML Content for Footer
    footer: `
        <button @click="closeModal()" class="btn btn-ghost">Cancel</button>
        <button @click="save()" class="btn btn-primary">Save</button>
    `
}) %>
```

## 2. Data Table (`partials/table.ejs`)

A comprehensive table component with built-in loading and empty states.

### Usage

```ejs
<%- include('partials/table', {
    loadingVar: 'loading',                      // Alpine variable for loading state
    emptyCheck: '!loading && items.length === 0', // Alpine expression for empty state
    emptyMessage: 'No items found',             // Text to show when empty
    colCount: 4,                                // Number of columns (for colspan)
    loopVar: 'item in items',                   // Alpine x-for loop expression
    keyVar: 'item.id',                          // Alpine :key expression
    
    // Table Header HTML
    headerHtml: `
        <th class="px-6 py-4 text-left">Name</th>
        <th class="px-6 py-4 text-right">Actions</th>
    `,
    
    // Table Row HTML (inside the loop)
    rowHtml: `
        <td class="px-6 py-4" x-text="item.name"></td>
        <td class="px-6 py-4 text-right">
            <button @click="edit(item)">Edit</button>
        </td>
    `
}) %>
```

## 3. Stat Card (`partials/stat-card.ejs`)

A specialized card for displaying dashboard statistics/metrics.

### Usage

```ejs
<%- include('partials/stat-card', {
    title: 'Total Users',           // Title text
    valueExpr: 'stats.totalUsers',  // Alpine expression for the value
    color: 'gold',                  // Theme color: 'gold', 'navy', 'emerald', 'amber', 'ruby'
    
    // SVG Icon Content
    icon: `<svg class="w-6 h-6" ...>...</svg>`,
    
    // Optional: Trend or description HTML
    descriptionHtml: `
        <p class="text-xs text-emerald-600 flex items-center">
            <svg...></svg> +5% this week
        </p>
    `
}) %>
```
