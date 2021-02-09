(function(window) {
  window["env"] = window["env"] || {};
  // Environment variables
  window["env"]["BASE_URL"] = "${CRM_BASE_URL}";
  window["env"]["HOST_KEY_CLOAK"] = "${KEYCLOAK_BASE}";
  window["env"]["API"] = "${CRM_SERVICE}/api/v1";
  window["env"]["API_DMDC"] = "${DMDC_SERVICE}/api/v1";
  window["env"]["API_DOISOAT"] = "${DOISOAT_SERVICE}/api/v1";
  window["env"]["API_IM"] = "${IM_SERVICE}/api/v1";
  window["env"]["API_BILLING"] = "${BILLING_SERVICE}/api/v1";
})(this);
