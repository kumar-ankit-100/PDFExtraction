"""
Simplified and optimized prompt template for Gemini 2.0 Flash.
Focuses on practical extraction with clear structure.
"""

EXTRACTION_PROMPT_TEMPLATE = """You are a financial data extraction expert. Extract ALL data from this fund report PDF and return it as detailed JSON.

CRITICAL RULES:
1. You MUST return ONLY valid JSON - no explanations, no markdown, no code blocks
2. Start your response with {{ and end with }}
3. Extract EVERY number, percentage, and text value you see in the document
4. For missing data, use null (not 0, not empty string)
5. For Portfolio Summary: Find all fund metrics, performance data, regional and industry breakdowns

3. **STATEMENT OF CASHFLOWS - TABLE EXTRACTION:**
   Find the "Statement of Cashflows" table in the PDF. Extract values for each line item across all three time periods (Current Period, Prior Period, Year to Date).
   
   The statement has THREE main sections:
   
   A. OPERATING ACTIVITIES SECTION:
   - "Cash flows from operating activities" (section header)
   - "Net increase/(decrease) in partners' capital"
   - "Adjustments to reconcile net increase/(decrease)"
   - "Net realized (gain)/loss on investments"
   - "Net change in unrealized (gain)/loss on investments"
   - "Changes in operating assets and liabilities"
   - "(Increase)/decrease in due from affiliates"
   - "(Increase)/decrease in due from third party"
   - "(Increase)/decrease in due from investment"
   - "Purchase of investments"
   - "Proceeds from sale of investments"
   - "Net cash provided by/(used in) operating activities" (subtotal)
   
   B. FINANCING ACTIVITIES SECTION:
   - "Cash flows from financing activities" (section header)
   - "Capital contributions"
   - "Distributions"
   - "Increase/(decrease) in due to limited partners"
   - "Increase/(decrease) in due to affiliates"
   - "(Increase)/decrease in due from limited partners"
   - "Proceeds from loans"
   - "Repayment of loans"
   - "Net cash provided by/(used in) financing activities" (subtotal)
   
   C. CASH SUMMARY SECTION:
   - "Net increase/(decrease) in cash and cash equivalents"
   - "Cash and cash equivalents, beginning of period"
   - "Cash and cash equivalents, end of period"
   
   D. SUPPLEMENTAL INFORMATION:
   - "Supplemental disclosure of cash flow information"
   - "Cash paid for interest"
   
   **EXTRACTION INSTRUCTIONS:**
   - Look for similar wording in the PDF (exact text may vary slightly)
   - Extract ACTUAL numbers from the table - each period should have DIFFERENT values
   - For section headers without values, use null
   - Negative numbers are often shown in parentheses: (1000) means -1000
   - Each line item should have three values: current_period, prior_period, year_to_date

4. **PCAP STATEMENT - TABLE EXTRACTION:**
   Find the "PCAP Statement" or "Partners' Capital Account" or "Statement of Changes in Partners' Capital" table.
   Extract values for each line item across all three time periods (Current Period, Prior Period, Year to Date).
   
   The statement has FOUR main sections:
   
   A. NAV MOVEMENTS SECTION:
   - "Beginning NAV - Net of Incentive Allocation"
   - "Contributions - Cash & Non-Cash"
   - "Distributions - Cash & Non-Cash"
   - "Total Cash / Non-Cash Flows"
   
   B. FEES AND EXPENSES SECTION:
   - "(Management Fees - Gross of Offsets, Waivers & Rebates)"
   - "(Management Fee Rebate)"
   - "(Partnership Expenses - Total)"
   - "Total Offsets to Fees & Expenses"
   - "Fee Waiver"
   
   C. INCOME AND PERFORMANCE SECTION:
   - "Interest Income"
   - "Dividend Income"
   - "(Interest Expense)"
   - "Other Income/(Expense)"
   - "Total Net Operating Income / (Expense)"
   - "(Placement Fees)"
   - "Realized Gain / (Loss)"
   - "Change in Unrealized Gain / (Loss)"
   
   D. ENDING NAV AND COMMITMENTS SECTION:
   - "Ending NAV - Net of Incentive Allocation"
   - "Incentive Allocation - Paid During the Period"
   - "Accrued Incentive Allocation - Periodic Change"
   - "Accrued Incentive Allocation - Ending Period Balance"
   - "Ending NAV - Gross of Accrued Incentive Allocation"
   - "Total Commitment"
   - "Beginning Unfunded Commitment"
   - "Plus Recallable Distributions"
   - "Less Expired/Released Commitments"
   - "+/- Other Unfunded Adjustment"
   - "Ending Unfunded Commitment"
   
   **EXTRACTION INSTRUCTIONS:**
   - Look for similar wording in the PDF (exact text may vary slightly)
   - Extract ACTUAL numbers from the table - each period should have DIFFERENT values
   - Negative numbers are often in parentheses: (1000) means -1000
   - Items in parentheses like "(Management Fees...)" are typically expenses (negative)
   - Each line item should have three values: current_period, prior_period, year_to_date

5. Numbers: Remove $ and commas (e.g., "$1,000,000" becomes 1000000)
6. Percentages: Convert to decimals (e.g., "15.5%" becomes 15.5)
7. Negative numbers in parentheses: "(1000)" becomes -1000
8. Dates: Format as YYYY-MM-DD
9. Missing/blank cells: Use null (not 0)
10. Return ONLY valid JSON (no markdown code blocks, no explanations)

DOCUMENT TEXT:
{extracted_text}

Return JSON with this EXACT structure (fill with ALL data from the document):

{{
  "portfolio_summary": {{
    "general_partner": "extract GP name",
    "fund_name": "extract fund name",
    "fund_currency": "USD or other",
    "reporting_period": "extract period",
    "report_date": "YYYY-MM-DD",
    "fund_inception_date": "YYYY-MM-DD",
    "total_commitments": 0,
    "total_drawdowns": 0,
    "remaining_commitments": 0,
    "total_distributions": 0,
    "net_contributions": 0,
    "assets_under_management": 0,
    "nav": 0,
    "fair_value": 0,
    "active_funds": 0,
    "active_portfolio_companies": 0,
    "total_investments": 0,
    "realized_investments": 0,
    "unrealized_investments": 0,
    "dpi": 0,
    "rvpi": 0,
    "tvpi": 0,
    "irr": 0,
    "moic": 0,
    "north_america_percent": 0,
    "europe_percent": 0,
    "asia_percent": 0,
    "other_region_percent": 0,
    "consumer_goods_percent": 0,
    "it_percent": 0,
    "financials_percent": 0,
    "healthcare_percent": 0,
    "services_percent": 0,
    "industrials_percent": 0,
    "other_industry_percent": 0
  }},
  
  "schedule_of_investments": [
    {{
      "company": "...",
      "fund": "...",
      "reported_date": "YYYY-MM-DD",
      "investment_status": "...",
      "security_type": "...",
      "initial_investment_date": "YYYY-MM-DD",
      "total_invested": 0,
      "current_cost": 0,
      "reported_value": 0,
      "realized_proceeds": 0,
      "fund_ownership_percent": 0,
      "valuation_policy": "...",
      "investment_multiple": 0,
      "irr": 0
    }}
  ],
  
  "statement_of_operations": [
    {{
      "period": "...",
      "portfolio_interest_income": 0,
      "portfolio_dividend_income": 0,
      "total_income": 0,
      "management_fees_net": 0,
      "professional_fees": 0,
      "total_expenses": 0,
      "net_operating_income": 0,
      "net_realized_gain_loss": 0,
      "net_unrealized_gain_loss": 0,
      "net_increase_in_capital": 0
    }}
  ],
  
  "statement_of_cashflows": {{
    "operating_activities": {{
      "section_header": null,
      "net_increase_decrease_partners_capital": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "adjustments_to_reconcile": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "net_realized_gain_loss_investments": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "net_change_unrealized_gain_loss": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "changes_in_operating_assets_liabilities": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "increase_decrease_due_from_affiliates": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "increase_decrease_due_from_third_party": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "increase_decrease_due_from_investment": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "purchase_of_investments": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "proceeds_from_sale_of_investments": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "net_cash_provided_by_operating_activities": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}}
    }},
    "financing_activities": {{
      "section_header": null,
      "capital_contributions": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "distributions": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "increase_decrease_due_to_limited_partners": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "increase_decrease_due_to_affiliates": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "increase_decrease_due_from_limited_partners": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "proceeds_from_loans": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "repayment_of_loans": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "net_cash_provided_by_financing_activities": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}}
    }},
    "cash_summary": {{
      "net_increase_decrease_cash": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "cash_beginning_of_period": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "cash_end_of_period": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}}
    }},
    "supplemental_information": {{
      "supplemental_disclosure_header": null,
      "cash_paid_for_interest": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}}
    }}
  }},
  
  "pcap_statement": {{
    "nav_movements": {{
      "beginning_nav_net_of_incentive": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "contributions_cash_non_cash": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "distributions_cash_non_cash": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "total_cash_non_cash_flows": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}}
    }},
    "fees_and_expenses": {{
      "management_fees_gross": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "management_fee_rebate": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "partnership_expenses_total": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "total_offsets_to_fees_expenses": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "fee_waiver": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}}
    }},
    "income_and_performance": {{
      "interest_income": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "dividend_income": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "interest_expense": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "other_income_expense": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "total_net_operating_income": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "placement_fees": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "realized_gain_loss": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "change_in_unrealized_gain_loss": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}}
    }},
    "ending_nav_and_commitments": {{
      "ending_nav_net_of_incentive": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "incentive_allocation_paid": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "accrued_incentive_allocation_change": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "accrued_incentive_allocation_balance": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "ending_nav_gross_of_incentive": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "total_commitment": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "beginning_unfunded_commitment": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "plus_recallable_distributions": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "less_expired_released_commitments": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "other_unfunded_adjustment": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}},
      "ending_unfunded_commitment": {{"current_period": 0, "prior_period": 0, "year_to_date": 0}}
    }}
  }},
  
  "portfolio_company_profile": [
    {{
      "company_name": "...",
      "initial_investment_date": "YYYY-MM-DD",
      "industry": "...",
      "headquarters": "...",
      "company_description": "...",
      "fund_ownership_percent": 0,
      "securities_held": "...",
      "investment_commitment": 0,
      "invested_capital": 0,
      "reported_value": 0,
      "investment_multiple": 0,
      "irr": 0,
      "investment_thesis": "...",
      "exit_expectations": "...",
      "recent_events": "...",
      "valuation_methodology": "...",
      "risk_assessment": "..."
    }}
  ],
  
  "portfolio_company_financials": [
    {{
      "company": "...",
      "company_currency": "...",
      "operating_data_date": "YYYY-MM-DD",
      "ltm_revenue": 0,
      "ltm_ebitda": 0,
      "cash": 0,
      "gross_debt": 0,
      "yoy_revenue_growth": 0,
      "ebitda_margin": 0,
      "total_enterprise_value": 0,
      "tev_multiple": 0
    }}
  ],
  
  "footnotes": [
    {{
      "note_number": 0,
      "note_header": "...",
      "description": "..."
    }}
  ],
  
  "reference_values": {{
    "investment_status_types": [],
    "security_types": [],
    "industries": [],
    "currencies": [],
    "valuation_methods": []
  }}
}}

CRITICAL REQUIREMENTS - YOUR JSON MUST INCLUDE ALL THESE SECTIONS:
✓ portfolio_summary (with all 37+ fields including fund info, metrics, and breakdowns)
✓ schedule_of_investments (array of all portfolio companies with investment details)
✓ statement_of_operations (array with period-based income/expense data)
✓ statement_of_cashflows (nested object with 4 sections):
  - operating_activities (12 fields, each with current_period, prior_period, year_to_date)
  - financing_activities (9 fields, each with current_period, prior_period, year_to_date)
  - cash_summary (3 fields, each with current_period, prior_period, year_to_date)
  - supplemental_information (2 fields)
✓ pcap_statement (nested object with 4 sections):
  - nav_movements (4 fields, each with current_period, prior_period, year_to_date)
  - fees_and_expenses (5 fields, each with current_period, prior_period, year_to_date)
  - income_and_performance (8 fields, each with current_period, prior_period, year_to_date)
  - ending_nav_and_commitments (11 fields, each with current_period, prior_period, year_to_date)
✓ portfolio_company_profile (array of companies with detailed profiles)
✓ portfolio_company_financials (array of company financial metrics)
✓ footnotes (array of explanatory notes)
✓ reference_values (object with arrays of unique values found in the document)

RESPONSE FORMAT RULES:
1. Your response MUST start with {{ and end with }}
2. Do NOT include any text before or after the JSON
3. Do NOT wrap the JSON in markdown code blocks (```json)
4. Include ALL 9 sections listed above (even if some arrays are empty [])
5. For statement_of_cashflows: Use nested structure with descriptive field names
6. For pcap_statement: Use nested structure with descriptive field names
7. Each field in cashflows/pcap should have three values: current_period, prior_period, year_to_date
8. If you cannot find data for a field, use null (not 0, not empty string)
9. Extract ALL tables, ALL companies, ALL financial data from the document
10. Maintain high accuracy - double-check numbers match the PDF exactly

Now extract the data and return ONLY the complete JSON with ALL 9 sections:"""

VALIDATION_PROMPT = """Fix and validate this JSON. Ensure all numeric fields are numbers (not strings), all dates are YYYY-MM-DD format, and structure is correct.

{extracted_data}

Return the corrected JSON only."""
