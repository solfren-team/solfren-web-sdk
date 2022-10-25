import * as neo4j from 'neo4j-driver';
import { Follow } from './types';

export default class SolFrenFollow {
  private driver: neo4j.Driver;

  public constructor(url: string, username: string, password: string) {
    this.driver = neo4j.driver(url, neo4j.auth.basic(username, password));
  }

  // Don't forget to close the driver connection when you're finished with it.
  public async close() {
    await this.driver.close();
  }

  public async follow(walletAddress: string, followAddress: string, type: string) {
    if (type !== 'Wallet' && type !== 'NFT' && type !== 'Collection') {
      throw new Error(`follow type not supported`);
    }

    const session = this.driver.session({ database: 'neo4j' });
    try {
      const writeQuery = `MERGE (m1:Wallet { address: $walletAddress })
                          MERGE (m2:${type} { address: $followAddress })
                          MERGE (m1)-[:FOLLOWS]->(m2)`;
      await session.writeTransaction(tx => tx.run(writeQuery, { walletAddress, followAddress }));
    } catch (err) {
      throw new Error(`failed to follow: ${err}`);
    } finally {
      await session.close();
    }
  }

  public async unfollow(walletAddress: string, followAddress: string, type: string) {
    if (type !== 'Wallet' && type !== 'NFT' && type !== 'Collection') {
      throw new Error(`follow type not supported`);
    }

    const session = this.driver.session({ database: 'neo4j' });
    try {
      const writeQuery = `MATCH (m1:Wallet { address: $walletAddress })
                          MATCH (m2:${type} { address: $followAddress })
                          MATCH (m1)-[r:FOLLOWS]->(m2)
                          DELETE r`;
      await session.writeTransaction(tx => tx.run(writeQuery, { walletAddress, followAddress }));
    } catch (err) {
      throw new Error(`failed to unfollow: ${err}`);
    } finally {
      await session.close();
    }
  }

  public async listFollowers(walletAddress: string, type: string): Promise<Follow[]> {
    if (type !== 'Wallet' && type !== 'NFT' && type !== 'Collection') {
      throw new Error(`follow type not supported`);
    }

    const session = this.driver.session({ database: 'neo4j' });
    try {
      const follows: Follow[] = [];
      const writeQuery = `MATCH (:${type} { address: $walletAddress })<-[:FOLLOWS]-(w) RETURN w`;
      const writeResult = await session.writeTransaction(tx => tx.run(writeQuery, { walletAddress }));
      writeResult.records.forEach(record => {
        follows.push(record.get('w'));
      });

      return follows;
    } catch (err) {
      throw new Error(`failed to listFollowers: ${err}`);
    } finally {
      await session.close();
    }
  }

  public async listFollowings(walletAddress: string, type: string): Promise<Follow[]> {
    if (type !== 'Wallet') {
      throw new Error(`follow type not supported`);
    }

    const session = this.driver.session({ database: 'neo4j' });
    try {
      const follows: Follow[] = [];
      const writeQuery = `MATCH (:Wallet { address: $walletAddress })-[:FOLLOWS]->(w:${type}) RETURN w`;
      const writeResult = await session.writeTransaction(tx => tx.run(writeQuery, { walletAddress }));
      writeResult.records.forEach(record => {
        follows.push(record.get('w'));
      });

      return follows;
    } catch (err) {
      throw new Error(`failed to listFollowing: ${err}`);
    } finally {
      await session.close();
    }
  }
}
