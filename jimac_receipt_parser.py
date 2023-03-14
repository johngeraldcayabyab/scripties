import pandas as pd
import re
import json


def get_or_no(JOURNAL):
    PARSED_CASHIER = re.findall("O\.R\. No\.: (.*)", JOURNAL)
    return PARSED_CASHIER[0].strip()


def get_cashier(JOURNAL):
    PARSED_CASHIER = re.findall("Cashier: (.*)", JOURNAL)
    PARSED_CASHIER_CLEANUP = PARSED_CASHIER[0].strip().replace(" ", "").title().split(',')
    PARSED_CASHIER_CLEANUP.reverse()
    return ' '.join(PARSED_CASHIER_CLEANUP)


def get_items(JOURNAL):
    PARSED_ORDERS = re.findall("OFFICIAL\sRECEIPT(?s:.*)TOTAL", JOURNAL)
    PARSED_ORDERS = re.findall('---------------------------------(?s:.*)---------------------------------',
                               PARSED_ORDERS[0])
    PARSED_ORDERS = PARSED_ORDERS[0].replace('TAKE-OUT', '').replace('DINE-IN', '').replace(
        '---------------------------------', '')
    PARSED_ORDERS = PARSED_ORDERS.strip().split('\n')
    NEW_ARRS = []
    for index, PARSED_ORDER in enumerate(PARSED_ORDERS):
        PARSED_ITEM_CLEANED = PARSED_ORDER.strip().replace(" ", " ")
        if len(PARSED_ITEM_CLEANED) == 30:
            ITEM_NAME = PARSED_ITEM_CLEANED[:16].strip()
            ITEM_QUANTITY = PARSED_ITEM_CLEANED[19].strip().replace(',', '')
            ITEM_TOTAL = PARSED_ITEM_CLEANED[20:].strip().replace('V', '').replace(',', '').replace('Z', '')
            ITEM_UNIT_PRICE = float(ITEM_TOTAL) / int(ITEM_QUANTITY)
            NEW_ARRS.append([
                ITEM_NAME,
                ITEM_QUANTITY,
                ITEM_UNIT_PRICE,
                ITEM_TOTAL
            ])
        else:
            NEW_ARRS[-1][0] = NEW_ARRS[-1][0] + PARSED_ITEM_CLEANED
    return NEW_ARRS


def parse_journal():
    df = pd.read_csv("./csv/final.csv", sep=';')
    actualDf = df.dropna(subset=['TRANSNO'])
    parsed_journal = []
    for index, row in actualDf.iterrows():
        TRANSNO = row[0]
        TRANSDATE = row[1]  # IMPORTANT
        BRN_CODE = row[2]
        TER_CODE = row[3]
        CAS_CODE = row[4]
        TAG = row[5]
        JOURNAL = row[6]

        if "REFUND" in JOURNAL:
            continue

        OR_NO = get_or_no(JOURNAL)
        CASHIER = get_cashier(JOURNAL)  # IMPORTANT
        ITEMS = get_items(JOURNAL)  # IMPORTANT

        parsed_journal.append({
            'sequence': OR_NO,
            'date': TRANSDATE,
            'cashier': CASHIER,
            'items': ITEMS
        })

    return parsed_journal


with open('data.json', 'w') as f:
    json.dump(parse_journal(), f)
