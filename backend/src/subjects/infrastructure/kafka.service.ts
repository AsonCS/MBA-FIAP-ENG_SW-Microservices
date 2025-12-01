import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { SubjectType } from '../domain/subject.enum';

/**
 * KafkaService
 * Manages Kafka producer for publishing messages to topics
 */
@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Initialize Kafka client and producer
   */
  private async connect(): Promise<void> {
    try {
      this.kafka = new Kafka({
        clientId: 'backend-service',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        connectionTimeout: 10000,
        requestTimeout: 25000,
        retry: {
          retries: 8,
          initialRetryTime: 300,
          maxRetryTime: 30000,
        },
      });

      this.producer = this.kafka.producer({
        allowAutoTopicCreation: true,
        idempotent: true,
        maxInFlightRequests: 5,
      });

      await this.producer.connect();
      this.logger.log('Kafka producer connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka', error);
      throw error;
    }
  }

  /**
   * Disconnect Kafka producer
   */
  private async disconnect(): Promise<void> {
    try {
      if (this.producer) {
        await this.producer.disconnect();
        this.logger.log('Kafka producer disconnected');
      }
    } catch (error) {
      this.logger.error('Error disconnecting Kafka producer', error);
    }
  }

  /**
   * Publish a message to a Kafka topic
   * @param subject Subject/topic name
   * @param message Message payload
   * @returns The message metadata from Kafka
   */
  async publishMessage(subject: SubjectType, message: object): Promise<any> {
    try {
      const result = await this.producer.send({
        topic: subject,
        messages: [
          {
            key: null,
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
        timeout: 30000,
      });

      this.logger.debug(
        `Message published to topic '${subject}':`,
        JSON.stringify(message),
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to publish message to topic '${subject}'`,
        error,
      );
      throw error;
    }
  }

  /**
   * Publish multiple messages to a Kafka topic
   * @param subject Subject/topic name
   * @param messages Array of message payloads
   * @returns The message metadata from Kafka
   */
  async publishMessages(
    subject: SubjectType,
    messages: object[],
  ): Promise<any> {
    try {
      const result = await this.producer.send({
        topic: subject,
        messages: messages.map((message) => ({
          key: null,
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        })),
        timeout: 30000,
      });

      this.logger.debug(
        `${messages.length} messages published to topic '${subject}'`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to publish messages to topic '${subject}'`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get producer health status
   */
  async isHealthy(): Promise<boolean> {
    try {
      return this.producer && !this.producer.isIdempotent;
    } catch (error) {
      return false;
    }
  }
}
