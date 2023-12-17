public with sharing class ProductSearchController {
    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getPricebookEntries(Id pricebook2Id) {
        return [
            SELECT Id, Product2Id, Product2.Name, Product2.Family, UnitPrice 
            FROM PricebookEntry 
            WHERE Pricebook2.IsStandard = false
            AND Pricebook2Id = :pricebook2Id
            AND Product2.IsActive = true
            ORDER BY UnitPrice DESC
        ];
    }

    @AuraEnabled
    public static List<OpportunityLineItem> createLineItems(List<OpportunityLineItem> lineItems) {
        insert lineItems;
        return lineItems;
    }
}