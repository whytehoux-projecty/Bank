import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  CountryCode as PlaidCountryCode,
  Products as PlaidProducts,
} from "plaid";

const configuration = new Configuration({
  basePath:
    PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

// Get multiple accounts from a user
export const getAccounts = async ({ accessToken }: getAccountsProps) => {
  try {
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];
    const institution = await getInstitution({
      institutionId: accountsResponse.data.item.institution_id!,
    });

    const account = {
      id: accountData.account_id,
      availableBalance: accountData.balances.available!,
      currentBalance: accountData.balances.current!,
      institutionId: institution.institution_id,
      name: accountData.name,
      officialName: accountData.official_name,
      mask: accountData.mask!,
      type: accountData.type as string,
      subtype: accountData.subtype! as string,
      appwriteItemId: "",
      shareableId: "",
    };

    return parseStringify(account);
  } catch (error) {
    console.error("An error occurred while getting the account:", error);
  }
};

// Get one account
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    // get bank from db
    const bank = await getBankByAccountId({ accountId: appwriteItemId });

    const accountsResponse = await plaidClient.accountsGet({
      access_token: bank.accessToken,
    });
    const accountData = accountsResponse.data.accounts[0];

    // get transfer transactions from appwrite
    const transferTransactionsData = await getTransactionsByBankId({
      bankId: bank.$id,
    });

    const transferTransactions = transferTransactionsData.documents.map(
      (transferData: Transaction) => ({
        id: transferData.$id,
        name: transferData.name!,
        amount: transferData.amount!,
        date: transferData.$createdAt,
        paymentChannel: transferData.channel,
        category: transferData.category,
        type: transferData.senderBankId === bank.$id ? "debit" : "credit",
      })
    );

    // get institution info from plaid
    const institution = await getInstitution({
      institutionId: accountsResponse.data.item.institution_id!,
    });

    const transactions = await getTransactions({
      accessToken: bank?.accessToken,
    });

    const account = {
      id: accountData.account_id,
      availableBalance: accountData.balances.available!,
      currentBalance: accountData.balances.current!,
      institutionId: institution.institution_id,
      name: accountData.name,
      officialName: accountData.official_name,
      mask: accountData.mask!,
      type: accountData.type as string,
      subtype: accountData.subtype! as string,
      appwriteItemId: bank.$id,
      shareableId: encryptId(accountData.account_id),
    };

    // sort transactions by date such that the most recent transaction is first
    const allTransactions = [...transactions, ...transferTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error("An error occurred while getting the account:", error);
  }
};

// Get bank info
export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: [PlaidCountryCode.Us],
    });

    const intitution = institutionResponse.data.institution;

    return parseStringify(intitution);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get transactions
export const getTransactions = async ({
  accessToken,
}: getTransactionsProps) => {
  let hasMore = true;
  let transactions: any = [];

  try {
    // Iterate through each page of new transaction updates for item
    while (hasMore) {
      const response = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: "2018-01-01",
        end_date: "2024-01-01",
      });

      const data = response.data;

      transactions = response.data.transactions;

      hasMore = data.total_transactions > transactions.length;
    }

    return parseStringify(transactions);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Create Link Token
export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id,
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: [PlaidProducts.Auth],
      language: "en",
      country_codes: [PlaidCountryCode.Us],
    };

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: response.data.link_token });
  } catch (error) {
    console.log(error);
  }
};

// Exchange public token for access token
export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    // Exchange public token for access token and item ID
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get account information from Plaid using the access token
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];

    // Create a bank account using the account information
    const request: CreateBankAccountProps = {
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl: "",
      shareableId: encryptId(accountData.account_id),
    };

    const newBankAccount = await createBankAccount(request);

    // Revalidate the path to reflect the changes
    revalidatePath("/");

    return parseStringify({
      publicTokenExchange: "complete",
    });
  } catch (error) {
    console.error("An error occurred while creating exchanging token:", error);
  }
};

import { parseStringify, encryptId } from "./utils";
import {
  getBankByAccountId,
  getTransactionsByBankId,
  createBankAccount,
} from "./actions/user.actions";
import { revalidatePath } from "next/cache";

// Type definitions
interface getAccountsProps {
  accessToken: string;
}

interface getAccountProps {
  appwriteItemId: string;
}

interface getInstitutionProps {
  institutionId: string;
}

interface getTransactionsProps {
  accessToken: string;
}

interface exchangePublicTokenProps {
  publicToken: string;
  user: User;
}

interface CreateBankAccountProps {
  userId: string;
  bankId: string;
  accountId: string;
  accessToken: string;
  fundingSourceUrl: string;
  shareableId: string;
}

type CountryCode = "US" | "GB" | "ES" | "NL" | "FR" | "IE" | "CA" | "DE" | "IT";
type Products =
  | "transactions"
  | "auth"
  | "identity"
  | "assets"
  | "investments"
  | "liabilities"
  | "payment_initiation";

interface User {
  $id: string;
  firstName: string;
  lastName: string;
}

interface Transaction {
  $id: string;
  name: string;
  amount: number;
  $createdAt: string;
  channel: string;
  category: string;
  senderBankId: string;
}
