const cleanupDuplicateIndexes = async (sequelizeInstance) => {
  try {
    console.log('Checking for duplicate database indexes...');
    
    // 1. Check policies table
    const [policiesIndexes] = await sequelizeInstance.query("SHOW INDEX FROM `policies`");
    const policiesDropped = [];
    
    for (const idx of policiesIndexes) {
      const keyName = idx.Key_name;
      if (keyName === 'PRIMARY') continue;
      
      // Matches duplicate indexes like policyId_2, policyId_3, etc. or duplicates on policyId column
      if (keyName.match(/policyId_\d+$/i) || (keyName !== 'policyId' && idx.Column_name === 'policyId')) {
        if (!policiesDropped.includes(keyName)) {
          console.log(`Cleaning duplicate index: policies.${keyName}`);
          try {
            await sequelizeInstance.query(`ALTER TABLE \`policies\` DROP INDEX \`${keyName}\``);
            policiesDropped.push(keyName);
          } catch (err) {
            console.error(`Failed to drop index ${keyName} from policies:`, err.message);
          }
        }
      }
    }

    // 2. Check payments table
    const [paymentsIndexes] = await sequelizeInstance.query("SHOW INDEX FROM `payments`");
    const paymentsDropped = [];
    
    for (const idx of paymentsIndexes) {
      const keyName = idx.Key_name;
      if (keyName === 'PRIMARY') continue;
      
      // Matches duplicate indexes like transactionId_2, transactionId_3, etc. or duplicates on transactionId column
      if (keyName.match(/transactionId_\d+$/i) || (keyName !== 'transactionId' && idx.Column_name === 'transactionId')) {
        if (!paymentsDropped.includes(keyName)) {
          console.log(`Cleaning duplicate index: payments.${keyName}`);
          try {
            await sequelizeInstance.query(`ALTER TABLE \`payments\` DROP INDEX \`${keyName}\``);
            paymentsDropped.push(keyName);
          } catch (err) {
            console.error(`Failed to drop index ${keyName} from payments:`, err.message);
          }
        }
      }
    }
    
    console.log(`Database index cleanup finished. Dropped ${policiesDropped.length} keys in policies and ${paymentsDropped.length} keys in payments.`);
  } catch (error) {
    console.warn('Index cleanup warning (might be because tables do not exist yet):', error.message);
  }
};

module.exports = cleanupDuplicateIndexes;
