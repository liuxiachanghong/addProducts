import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import createLineItems from "@salesforce/apex/ProductSearchController.createLineItems";

export default class ProductItems extends LightningElement {
  @api recordId;
  @api records;
  @track draftValues = [];
  @track createButtonDisabled = false;
  @track isLoading = false;

  @track columns = [
    { label: "Product Name", fieldName: "Name", editable: false },
    {
      label: "Sales Price",
      fieldName: "ListPrice",
      type: "currency",
      editable: true,
    },
    {
      label: "Quantity",
      fieldName: "Quantity",
      type: "number",
      editable: true,
    },
    { label: "Total", fieldName: "Total", type: "currency" },
  ];

  handleSave(event) {
    this.draftValues = event.detail.draftValues;
    const updatedRecords = this.records.map((record) => {
      const draftUpdate = this.draftValues.find(
        (draft) => draft.Id === record.Id
      );
      if (draftUpdate) {
        let newTotal = record.Total;
        if (
          draftUpdate.Quantity !== undefined ||
          draftUpdate.ListPrice !== undefined
        ) {
          const newQuantity =
            draftUpdate.Quantity !== undefined
              ? draftUpdate.Quantity
              : record.Quantity;
          const newListPrice =
            draftUpdate.ListPrice !== undefined
              ? draftUpdate.ListPrice
              : record.ListPrice;
          newTotal = newQuantity * newListPrice;
        }
        return { ...record, ...draftUpdate, Total: newTotal };
      }
      return record;
    });
    this.records = updatedRecords;
    this.createButtonDisabled = false;
    this.draftValues = [];
  }

  handleCellChange(event) {
    this.createButtonDisabled = true;
    this.draftValues = event.detail.draftValues;
    const updatedRecords = this.records.map((record) => {
      const draftUpdate = this.draftValues.find(
        (draft) => draft.Id === record.Id
      );
      if (draftUpdate) {
        let newTotal = record.Total;
        if (
          draftUpdate.Quantity !== undefined ||
          draftUpdate.ListPrice !== undefined
        ) {
          const newQuantity =
            draftUpdate.Quantity !== undefined
              ? draftUpdate.Quantity
              : record.Quantity;
          const newListPrice =
            draftUpdate.ListPrice !== undefined
              ? draftUpdate.ListPrice
              : record.ListPrice;
          newTotal = newQuantity * newListPrice;
        }
        return { ...record, ...draftUpdate, Total: newTotal };
      }
      return record;
    });
    this.records = updatedRecords;
  }

  handleCreate() {
    this.isLoading = true;
    const remappedRecords = this.transformDataForOpportunityLineItems();

    createLineItems({ lineItems: remappedRecords })
      .then((result) => {
        this.showToast(
          "Success",
          "Pricebook Entries Created Successfully",
          "success",
          "pester"
        );
        this.handleCloseDatatable();
        this.isLoading = false;
      })
      .catch((error) => {
        console.error("Error in creating records:", error);
      });
  }

  transformDataForOpportunityLineItems() {
    return this.records.map((record) => {
      const item = {
        OpportunityId: this.recordId,
        PricebookEntryId: record.Id,
        Name: record.Name,
        Quantity: record.Quantity,
        UnitPrice: record.ListPrice,
      };
      return item;
    });
  }

  showToast(title, message, variant, mode) {
    const toastEvent = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
      mode: mode,
    });
    this.dispatchEvent(toastEvent);
  }

  handleCloseDatatable() {
    const event = new CustomEvent("closedatatable", {
      detail: { showDatatable: false },
    });
    this.dispatchEvent(event);
  }
}
