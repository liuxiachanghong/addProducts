import { LightningElement, wire, track, api } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getPricebookEntries from '@salesforce/apex/ProductSearchController.getPricebookEntries';
import OPPORTUNITY_PRICEBOOK2ID_FIELD from '@salesforce/schema/Opportunity.Pricebook2Id';


export default class ProductTreeGrid extends LightningElement {
    @api recordId;

    @track columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Family', fieldName: 'Family' },
        { label: 'List Price', fieldName: 'ListPrice', type: 'currency' }
    ];

    @track gridData;
    @track showTreeGrid = true;
    @track showDatatable = false;
    @track records;

    opportunityPricebook2Id;
    wiredOpportunityResult;

    @wire(getRecord, { recordId: '$recordId', fields: [OPPORTUNITY_PRICEBOOK2ID_FIELD] })
    wiredOpportunity({ data, error }) {
        if (data) {
            this.wiredOpportunityResult = data;
            this.opportunityPricebook2Id = data.fields.Pricebook2Id.value;
            this.loadPricebookEntries();
        } else if (error) {
            console.log('wiredOpportunity error:', error);
        }
    }

    loadPricebookEntries() {
        getPricebookEntries({ pricebook2Id: this.opportunityPricebook2Id })
            .then(result => {
                this.gridData = this.transformData(result);
            })
            .catch(error => {
                console.log('getPricebookEntries error:', error);
            });
    }

    transformData(data) {
        let treeData = [];
        let families = new Map();

        data.forEach(entry => {
            let family = entry.Product2.Family;
            if (!families.has(family)) {
                families.set(family, {
                    _children: [],
                    Id          : family, // Use Family as a unique key
                    Name        : family, // Group by Family
                    Family      : '',
                    ListPrice   : null,
                    Quantity    : null,
                    Total       : null
                });
            }
            families.get(family)._children.push({
                Id                  : entry.Id,
                Name                : entry.Product2.Name,
                Family              : family,
                ListPrice           : entry.UnitPrice,
                Quantity            : 1,
                Total               : entry.UnitPrice * 1,
            });
        });

        families.forEach((value, key) => {
            treeData.push(value);
        });

        return treeData;
    }

    handleSelectAction() {
        const grid = this.template.querySelector('lightning-tree-grid');
        const selectedRows = grid.getSelectedRows();
        this.records = selectedRows; 
        this.showTreeGrid = false; 
        this.showDatatable = true;
    }

    handleFinish(event) {
        this.showDatatable = event.detail.showDatatable;
        this.showSuccess = event.detail.showSuccess;
    }
}